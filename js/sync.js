'use strict';
// ═══════════════════════════════════════════════════════════════
// BUFF LIFE — SUPABASE CLOUD SYNC
// Trage hier deine Werte ein (aus Pharao's Sanctum kopieren):
// ═══════════════════════════════════════════════════════════════
const SUPABASE_URL = 'DEINE_SUPABASE_URL';   // z.B. https://xxxxxx.supabase.co
const SUPABASE_KEY = 'DEIN_ANON_KEY';         // anon public key

// ── SUPABASE CLIENT (kein npm nötig, direkt via fetch) ──────────
const SB = {
  url: SUPABASE_URL,
  key: SUPABASE_KEY,

  headers(){
    const h = {
      'Content-Type':  'application/json',
      'apikey':        this.key,
      'Authorization': `Bearer ${SYNC.token||this.key}`,
    };
    return h;
  },

  async from(table){ return new SBQuery(this, table); },

  async auth_magiclink(email){
    const res = await fetch(`${this.url}/auth/v1/otp`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify({ email, create_user: true }),
    });
    return res.ok;
  },

  async auth_session(){
    // Check URL hash for token after magic link redirect
    const hash = window.location.hash;
    if(hash.includes('access_token')){
      const params = new URLSearchParams(hash.replace('#',''));
      const token  = params.get('access_token');
      const refresh= params.get('refresh_token');
      if(token){ SYNC.token=token; SYNC.refresh=refresh; syncSaveToStorage(); }
      window.location.hash = '';
    }
    // Try refresh if we have a stored token
    if(SYNC.refresh){
      try{
        const res = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`,{
          method: 'POST',
          headers: this.headers(),
          body: JSON.stringify({ refresh_token: SYNC.refresh }),
        });
        if(res.ok){
          const d = await res.json();
          SYNC.token   = d.access_token;
          SYNC.refresh = d.refresh_token;
          syncSaveToStorage();
          return true;
        }
      }catch(e){}
    }
    return !!SYNC.token;
  },

  async auth_user(){
    if(!SYNC.token) return null;
    try{
      const res = await fetch(`${this.url}/auth/v1/user`,{ headers: this.headers() });
      return res.ok ? await res.json() : null;
    }catch(e){ return null; }
  },

  async auth_logout(){
    try{
      await fetch(`${this.url}/auth/v1/logout`,{ method:'POST', headers: this.headers() });
    }catch(e){}
    SYNC.token = null; SYNC.refresh = null; SYNC.user = null;
    syncSaveToStorage();
  },

  async upsert(table, data){
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method:  'POST',
      headers: { ...this.headers(), 'Prefer': 'resolution=merge-duplicates,return=minimal' },
      body:    JSON.stringify(data),
    });
    return res.ok;
  },

  async select(table, filter=''){
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      headers: this.headers(),
    });
    return res.ok ? await res.json() : null;
  },
};

// ── SYNC STATE ──────────────────────────────────────────────────
let SYNC = {
  token:    null,
  refresh:  null,
  user:     null,
  lastSync: null,
  status:   'offline', // 'offline' | 'syncing' | 'synced' | 'error' | 'loggedout'
};

const SYNC_KEY = 'bufflife-sync-meta';

function syncLoadFromStorage(){
  try{
    const d = JSON.parse(localStorage.getItem(SYNC_KEY)||'{}');
    SYNC.token   = d.token   || null;
    SYNC.refresh = d.refresh || null;
    SYNC.lastSync= d.lastSync|| null;
  }catch(e){}
}

function syncSaveToStorage(){
  try{
    localStorage.setItem(SYNC_KEY, JSON.stringify({
      token:    SYNC.token,
      refresh:  SYNC.refresh,
      lastSync: SYNC.lastSync,
    }));
  }catch(e){}
}

// ── PUSH: lokaler Stand → Cloud ──────────────────────────────────
async function syncPush(){
  if(!SYNC.token) return false;
  SYNC.status = 'syncing';
  updateSyncUI();
  try{
    const user = await SB.auth_user();
    if(!user){ SYNC.status='loggedout'; updateSyncUI(); return false; }
    SYNC.user = user;
    const ok = await SB.upsert('bufflife_saves', {
      user_id:    user.id,
      save_data:  S,
      updated_at: new Date().toISOString(),
    });
    if(ok){
      SYNC.lastSync = new Date().toISOString();
      SYNC.status   = 'synced';
      syncSaveToStorage();
    } else {
      SYNC.status = 'error';
    }
  }catch(e){
    SYNC.status = 'error';
    console.warn('Sync push error:', e);
  }
  updateSyncUI();
  return SYNC.status === 'synced';
}

// ── PULL: Cloud → lokaler Stand ──────────────────────────────────
async function syncPull(){
  if(!SYNC.token) return false;
  try{
    const user = await SB.auth_user();
    if(!user) return false;
    const rows = await SB.select('bufflife_saves', `user_id=eq.${user.id}&order=updated_at.desc&limit=1`);
    if(!rows || !rows.length) return false;
    const cloudSave = rows[0].save_data;
    const cloudTime = new Date(rows[0].updated_at).getTime();
    const localTime = S._lastSaved ? new Date(S._lastSaved).getTime() : 0;
    if(cloudTime > localTime){
      S = cloudSave;
      migrateState();
      saveState();
      float('☁️ Cloud-Stand geladen!', '#14b8a6');
      render();
      return true;
    }
    return false;
  }catch(e){
    console.warn('Sync pull error:', e);
    return false;
  }
}

// ── INIT: beim App-Start ─────────────────────────────────────────
async function syncInit(){
  if(SUPABASE_URL === 'DEINE_SUPABASE_URL') return; // nicht konfiguriert
  syncLoadFromStorage();
  const ok = await SB.auth_session();
  if(ok){
    SYNC.user = await SB.auth_user();
    SYNC.status = 'synced';
    await syncPull();           // neuesten Stand holen
    startAutoSync();
  } else {
    SYNC.status = 'loggedout';
  }
  updateSyncUI();
}

// ── AUTO-SYNC alle 5 Minuten ─────────────────────────────────────
let _autoSyncInterval = null;
function startAutoSync(){
  if(_autoSyncInterval) clearInterval(_autoSyncInterval);
  _autoSyncInterval = setInterval(()=>{
    if(SYNC.token) syncPush();
  }, 5 * 60 * 1000);
}

// ── PATCH saveState → immer auch pushen ──────────────────────────
const _origSaveState = saveState;
window.saveState = function(){
  S._lastSaved = new Date().toISOString();
  _origSaveState();
  if(SYNC.token) syncPush();
};
saveState = window.saveState;

// ── LOGIN-MODAL ──────────────────────────────────────────────────
function renderSyncModal(){
  const isLoggedIn = !!SYNC.token;
  const email = SYNC.user?.email || '';
  const lastSync = SYNC.lastSync
    ? new Date(SYNC.lastSync).toLocaleString('de',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})
    : 'Noch nie';

  return`<div class="overlay" onclick="closeModal()">
  <div class="modal" onclick="event.stopPropagation()">
    <div class="cinzel" style="font-size:14px;color:var(--accent3);font-weight:700;margin-bottom:14px;text-align:center">☁️ CLOUD SYNC</div>

    ${isLoggedIn ? `
      <div style="background:#0a1a0a;border:1px solid #166534;border-radius:10px;padding:10px 12px;margin-bottom:14px">
        <div style="font-size:10px;color:#22c55e;font-family:'Cinzel',serif;margin-bottom:3px">✓ EINGELOGGT</div>
        <div style="font-size:12px;color:#e9d5ff">${email}</div>
        <div style="font-size:9px;color:#4b5563;margin-top:3px">Letzter Sync: ${lastSync}</div>
      </div>
      <button onclick="syncPush().then(()=>render())" style="width:100%;padding:10px;border-radius:9px;border:none;background:linear-gradient(90deg,#0f766e,#14b8a6);color:#fff;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;margin-bottom:8px">
        ☁️ Manuell speichern
      </button>
      <button onclick="syncPull().then(()=>render())" style="width:100%;padding:10px;border-radius:9px;border:1px solid #14b8a6;background:transparent;color:#14b8a6;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;margin-bottom:14px">
        ⬇️ Stand von Cloud laden
      </button>
      <button onclick="SB.auth_logout().then(()=>{SYNC.status='loggedout';render()})" style="width:100%;padding:9px;border-radius:9px;border:none;background:transparent;color:#4b5563;font-size:11px;cursor:pointer">
        Ausloggen
      </button>
    ` : `
      <div style="font-size:11px;color:#9ca3af;margin-bottom:14px;line-height:1.6;text-align:center">
        Melde dich mit deiner E-Mail an.<br>Du bekommst einen Magic Link — kein Passwort nötig.
      </div>
      <input class="input-field" id="sync-email" type="email" placeholder="deine@email.de" style="outline:none">
      <button onclick="syncLogin()" style="width:100%;padding:11px;border-radius:9px;border:none;background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#fff;font-family:'Cinzel',serif;font-size:12px;font-weight:700;cursor:pointer;margin-bottom:8px">
        📧 Magic Link senden
      </button>
      <div style="font-size:9px;color:#4b5563;text-align:center">
        Kein Konto nötig — wird automatisch erstellt
      </div>
    `}

    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">
      <div style="font-size:9px;color:#374151;text-align:center">
        Status: <span style="color:${SYNC.status==='synced'?'#22c55e':SYNC.status==='syncing'?'#fbbf24':SYNC.status==='error'?'#ef4444':'#6b7280'}">
          ${{'synced':'✓ Synchronisiert','syncing':'⟳ Synchronisiert...','error':'✗ Fehler','offline':'○ Offline','loggedout':'○ Nicht eingeloggt'}[SYNC.status]||''}
        </span>
      </div>
    </div>
  </div></div>`;
}

async function syncLogin(){
  const email = document.getElementById('sync-email')?.value?.trim();
  if(!email){ float('⚠️ Bitte E-Mail eingeben!','#ef4444'); return; }
  const btn = document.querySelector('#sync-email + button');
  if(btn){ btn.textContent = '⏳ Wird gesendet...'; btn.disabled = true; }
  const ok = await SB.auth_magiclink(email);
  if(ok){
    float('📧 Magic Link gesendet! Prüfe deine E-Mails.','#22c55e');
    MODAL = null; render();
  } else {
    float('❌ Fehler beim Senden!','#ef4444');
    if(btn){ btn.textContent = '📧 Magic Link senden'; btn.disabled = false; }
  }
}

function updateSyncUI(){
  // Update sync indicator in header if visible
  const el = document.getElementById('sync-status-dot');
  if(!el) return;
  const colors = { synced:'#22c55e', syncing:'#fbbf24', error:'#ef4444', offline:'#374151', loggedout:'#374151' };
  el.style.background = colors[SYNC.status] || '#374151';
  el.title = SYNC.status;
}

// ── EXPOSE ────────────────────────────────────────────────────────
window.syncPush         = syncPush;
window.syncPull         = syncPull;
window.syncLogin        = syncLogin;
window.renderSyncModal  = renderSyncModal;
window.SB               = SB;
window.SYNC             = SYNC;

// Init on load
window.addEventListener('load', ()=> setTimeout(syncInit, 500));
