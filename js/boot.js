'use strict';
function render(){
  const app=document.getElementById("app");
  if(!S||!S.setup){
    app.innerHTML=renderPointBuy();
    return;
  }

  if(MODAL){
    if(MODAL.type==="boss"){
      app.innerHTML=`<div id="boss-screen" style="min-height:100vh;overflow-y:auto"></div>`;
      renderBossScreen();
      return;
    }
    if(MODAL.type==="rollresult"){app.innerHTML=`${buildShell()}${renderRollModal(MODAL.data)}`;return;}
    if(MODAL.type==="levelup"){app.innerHTML=`${buildShell()}${renderLvlUp()}`;return;}
    if(MODAL.type==="tutorial"){app.innerHTML=`${buildShell()}${renderTutorial()}`;return;}
    if(MODAL.type==="dailyEvent"){app.innerHTML=`${buildShell()}${renderDailyEventModal(MODAL.data.ev)}`;return;}
    if(MODAL.type==="archetypePicker"){app.innerHTML=`${buildShell()}${renderArchetypePicker()}`;return;}
    if(MODAL.type==="sync"){
      app.innerHTML=`${buildShell()}${typeof renderSyncModal==='function'?renderSyncModal():'<div class="overlay" onclick="closeModal()"><div class="modal"><p style="color:#6b7280;text-align:center">Sync wird geladen...</p></div></div>'}`;
      setTimeout(updateSyncUI,100);
      return;
    }
    if(MODAL.type==="prestigeConfirm"){
      app.innerHTML=`${buildShell()}<div class="overlay" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center;border-color:#f9a8d4;box-shadow:0 0 40px #f9a8d444">
        <div style="font-size:40px;margin-bottom:8px">🔰</div>
        <div class="cinzel" style="font-size:17px;color:#f9a8d4;font-weight:900;margin-bottom:6px">PRESTIGE AUFSTIEG</div>
        <div style="font-size:11px;color:#9ca3af;margin-bottom:12px;line-height:1.6">Level, XP, Inventar & Stats werden zurückgesetzt.<br>Du behältst: Zoo, Talente, 50% Gold, Erbstück.<br><span style="color:#fbbf24">Ein mächtiges Erbstück wartet auf dich!</span></div>
        <div style="display:flex;gap:8px">
          <button onclick="closeModal()" style="flex:1;padding:10px;border-radius:9px;border:none;background:#1f2937;color:#9ca3af;font-size:12px">Abbrechen</button>
          <button onclick="doPrestige()" style="flex:1;padding:10px;border-radius:9px;border:none;background:linear-gradient(90deg,#7c2d92,#f9a8d4);color:#000;font-family:'Cinzel',serif;font-size:12px;font-weight:900">🔰 Aufsteigen</button>
        </div>
      </div></div>`;return;
    }
    if(MODAL.type==="prestige"){
      const{pc,hItem}=MODAL.data;const r=RARITIES[hItem.rarity];
      app.innerHTML=`${buildShell()}<div class="overlay" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center;border-color:#f9a8d4;box-shadow:0 0 60px #f9a8d466;animation:levelUp .4s ease-out">
        <div style="font-size:48px;margin-bottom:6px">${PRESTIGE_ICONS[Math.min(pc,6)]}</div>
        <div class="cinzel" style="font-size:24px;color:#f9a8d4;font-weight:900">PRESTIGE #${pc}!</div>
        <div style="font-size:11px;color:#9ca3af;margin:8px 0 12px">Ein neues Kapitel beginnt.</div>
        <div style="background:#0d0b1e;border:1px solid ${r.border};border-radius:10px;padding:12px;margin-bottom:14px">
          <div style="font-size:28px;margin-bottom:4px">${hItem.icon}</div>
          <div class="cinzel" style="font-size:12px;color:${r.color};font-weight:700">${hItem.name}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:3px">${Object.entries(hItem.stats).map(([k,v])=>k+"+"+v).join(" · ")}</div>
          <div style="font-size:8px;color:#f9a8d4;margin-top:4px">🔰 Permanent — überlebt alle Prestiges</div>
        </div>
        <button onclick="closeModal()" class="btn-primary">Neues Abenteuer →</button>
      </div></div>`;return;
    }
    if(MODAL.type==="settings"){
      const curTheme=S.settings?.theme||"purple";
      const curSize=S.settings?.size||"normal";
      app.innerHTML=`${buildShell()}<div class="overlay" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()" style="max-height:85vh;overflow-y:auto">
        <div class="cinzel" style="font-size:14px;color:var(--accent3);font-weight:700;margin-bottom:14px;text-align:center">⚙️ EINSTELLUNGEN</div>

        <div class="section-title">🎨 DESIGN-THEMA</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:16px">
          ${Object.entries(THEMES).map(([key,t])=>{
            const active=curTheme===key;
            return`<button onclick="applyTheme('${key}','${curSize}');render()" style="padding:10px 8px;border-radius:10px;border:2px solid ${active?t.a3:"#2d2a6e"};background:${t.bg2};cursor:pointer;text-align:left;transition:all .15s">
              <div style="font-size:18px;margin-bottom:3px">${t.icon}</div>
              <div style="font-family:'Cinzel',serif;font-size:10px;color:${t.a3};font-weight:700">${t.name}</div>
              <div style="display:flex;gap:3px;margin-top:4px">
                <div style="width:12px;height:12px;border-radius:50%;background:${t.a1}"></div>
                <div style="width:12px;height:12px;border-radius:50%;background:${t.a2}"></div>
                <div style="width:12px;height:12px;border-radius:50%;background:${t.a3}"></div>
              </div>
              ${active?`<div style="font-size:9px;color:${t.a3};margin-top:3px">✓ Aktiv</div>`:""}
            </button>`;
          }).join("")}
        </div>

        <div class="section-title">📐 SCHRIFTGRÖSSE</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
          <button onclick="applyTheme('${curTheme}','normal');render()" style="padding:12px;border-radius:10px;border:2px solid ${curSize==='normal'?"var(--accent3)":"var(--border)"};background:${curSize==='normal'?"var(--accent-bg)":"var(--bg2)"};cursor:pointer">
            <div style="font-size:16px;margin-bottom:3px">🔤</div>
            <div style="font-family:'Cinzel',serif;font-size:11px;color:${curSize==='normal'?"var(--accent3)":"#9ca3af"};font-weight:700">Normal</div>
            <div style="font-size:9px;color:#6b7280;margin-top:2px">Standard</div>
          </button>
          <button onclick="applyTheme('${curTheme}','large');render()" style="padding:12px;border-radius:10px;border:2px solid ${curSize==='large'?"var(--accent3)":"var(--border)"};background:${curSize==='large'?"var(--accent-bg)":"var(--bg2)"};cursor:pointer">
            <div style="font-size:20px;margin-bottom:3px">🔠</div>
            <div style="font-family:'Cinzel',serif;font-size:11px;color:${curSize==='large'?"var(--accent3)":"#9ca3af"};font-weight:700">Groß</div>
            <div style="font-size:9px;color:#6b7280;margin-top:2px">Mehr Lesbarkeit</div>
          </button>
        </div>

        <div class="section-title">☁️ CLOUD SYNC</div>
        <button onclick="closeModal();setTimeout(()=>{MODAL={type:'sync'};render();},50)" style="width:100%;padding:10px;border-radius:9px;border:1px solid #14b8a6;background:#0a1a1a;color:#14b8a6;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer;margin-bottom:16px">☁️ Sync verwalten</button>
        <div class="section-title">💎 DATEN-KRISTALL</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
          <button onclick="exportSave()" style="padding:10px;border-radius:9px;border:1px solid var(--accent-border);background:var(--accent-bg);color:var(--accent3);font-family:'Cinzel',serif;font-size:10px;font-weight:700;cursor:pointer">💎 Exportieren</button>
          <button onclick="importSave()" style="padding:10px;border-radius:9px;border:1px solid #14b8a6;background:#0a1a1a;color:#14b8a6;font-family:'Cinzel',serif;font-size:10px;font-weight:700;cursor:pointer">📥 Importieren</button>
        </div>
        <div class="section-title" style="color:#ef4444">⚠️ GEFAHRENZONE</div>
        <button onclick="MODAL={type:'confirmDeleteSave'};render()" style="width:100%;padding:10px;border-radius:9px;border:1px solid #7f1d1d;background:#1a0505;color:#ef4444;font-family:'Cinzel',serif;font-size:11px;font-weight:700;cursor:pointer">🗑️ Spielstand löschen</button>
        <button onclick="closeModal()" style="width:100%;padding:9px;border-radius:9px;border:none;background:transparent;color:#4b5563;font-size:11px;margin-top:8px;cursor:pointer">✕ Schließen</button>
      </div></div>`;return;
    }
    if(MODAL.type==="confirmDeleteSave"){
      app.innerHTML=`${buildShell()}<div class="overlay"><div class="modal" style="text-align:center;border-color:#ef4444">
        <div style="font-size:36px;margin-bottom:8px">⚠️</div>
        <div class="cinzel" style="font-size:15px;color:#ef4444;font-weight:900;margin-bottom:6px">WIRKLICH LÖSCHEN?</div>
        <div style="font-size:11px;color:#9ca3af;margin-bottom:16px">Alle Daten — Level, Items, Zoo, alles — werden für immer gelöscht.</div>
        <div style="display:flex;gap:8px">
          <button onclick="closeModal()" style="flex:1;padding:10px;border-radius:9px;border:none;background:#1f2937;color:#9ca3af;font-size:12px">Abbrechen</button>
          <button onclick="deleteSave()" style="flex:1;padding:10px;border-radius:9px;border:none;background:linear-gradient(90deg,#7f1d1d,#dc2626);color:#fff;font-family:'Cinzel',serif;font-size:12px;font-weight:900">Löschen</button>
        </div>
      </div></div>`;return;
    }
    if(MODAL.type==="confirmDelete"){
      const {id,dungeonId}=MODAL.data;
      const qList=dungeonId?S.dungeons.find(d=>d.id===dungeonId)?.quests:S.quests;
      // eslint-disable-next-line eqeqeq
      const q=qList?.find(x=>x.id==id);
      app.innerHTML=`${buildShell()}<div class="overlay" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center">
        <div style="font-size:32px;margin-bottom:8px">🗑️</div>
        <div class="cinzel" style="font-size:15px;color:#f87171;margin-bottom:6px">Quest löschen?</div>
        <div style="font-size:13px;color:#9ca3af;margin-bottom:16px">"${q?.title||'Quest'}" wird dauerhaft entfernt.</div>
        <div style="display:flex;gap:8px">
          <button onclick="closeModal()" style="flex:1;padding:10px;border-radius:9px;border:none;background:#1f2937;color:#9ca3af;font-size:13px">Abbrechen</button>
          <button onclick="confirmDelete('${id}','${dungeonId||""}')" style="flex:1;padding:10px;border-radius:9px;border:none;background:linear-gradient(90deg,#7f1d1d,#dc2626);color:#fff;font-family:'Cinzel',serif;font-size:12px;font-weight:700">Löschen</button>
        </div>
      </div></div>`;
      return;
    }
  }

  app.innerHTML=buildShell();
}

function buildShell(){
  let content="";
  if(TAB==="quests"||TAB==="dungeons")content=renderQuests();
  else if(TAB==="zoo")content=renderZoo();
  else if(TAB==="gear")content=renderGear();
  else if(TAB==="shop")content=renderShop();
  else if(TAB==="heimstatt")content=renderHeimsatt();
  else if(TAB==="profil")content=renderProfil();

  return`${renderHeader()}<div id="content">${content}</div>${renderNav()}${renderAddSheet()}`;
}

// ═══════════════════════════════════════════════════════════════
// GLOBAL FUNCTIONS (called from HTML onclick attributes)
// Must be real function declarations, not window.x=() assignments
// ═══════════════════════════════════════════════════════════════
function setTab(t){TAB=t;if(t==="quests"||t==="dungeons")QUEST_SUBTAB=t==="dungeons"?"dungeons":"quests";render();}
function setZooTab(t){ZOO_SUBTAB=t;render();}
function setShopTab(t){SHOP_SUBTAB=t;render();}
function setCraftProf(p){CRAFT_PROF=p;render();}
let HEIMSTATT_SUBTAB="gebaeude";
let PROFIL_SUBTAB="profil";
function sellItem(uid,val){
  const item=S.inventory.find(i=>i.uid==uid);
  if(!item)return;
  if(Object.values(S.character.equipment).find(e=>e&&e.uid==uid)){float("❌ Erst ablegen!","#ef4444");return;}
  S.inventory=S.inventory.filter(i=>i.uid!=uid);
  S.character.gold+=val;
  addLog("🪙 Verkauft: "+item.name+" +"+val+" Gold");
  float("🪙 +"+val+" Gold für "+item.name,"#fbbf24");
  saveState();render();
}
function setQuestSubtab(t){QUEST_SUBTAB=t;render();}
function openAddSheet(){ADD_SHEET_OPEN=true;ADD_SHEET_TAB="quest";EDIT_QUEST_ID=null;render();}
function closeAddSheet(){ADD_SHEET_OPEN=false;EDIT_DUNGEON_ID=null;EDIT_QUEST_ID=null;render();}
function setAddTab(t){ADD_SHEET_TAB=t;EDIT_DUNGEON_ID=null;render();}
function setEditDungeon(id){EDIT_DUNGEON_ID=id;render();}

// Repeat type toggle (no re-render, just DOM swap for speed)
function setRepeatType(type){
  document.querySelectorAll("[id^='rtype-']").forEach(b=>{
    const active=b.id===`rtype-${type}`;
    b.style.borderColor=active?"var(--accent3)":"var(--border)";
    b.style.background=active?"var(--accent-bg)":"var(--bg2)";
    b.style.color=active?"var(--accent3)":"#6b7280";
  });
  document.getElementById("repeat-weekdays").style.display=type==="weekdays"?"flex":"none";
  document.getElementById("repeat-interval").style.display=type==="interval"?"flex":"none";
  document.getElementById("repeat-weekdays").dataset.type=type;
  // Store on a hidden input
  let h=document.getElementById("_repeat-type");
  if(!h){h=document.createElement("input");h.type="hidden";h.id="_repeat-type";document.body.appendChild(h);}
  h.value=type;
}

function toggleRepeatDay(i){
  const btn=document.getElementById(`rday-${i}`);
  const active=btn.style.color.includes("accent")||btn.style.borderColor.includes("accent")||btn.dataset.on==="1";
  btn.dataset.on=active?"0":"1";
  btn.style.borderColor=active?"var(--border)":"var(--accent3)";
  btn.style.background=active?"var(--bg2)":"var(--accent-bg)";
  btn.style.color=active?"#6b7280":"var(--accent3)";
}

function toggleNotif(){
  const btn=document.getElementById("notif-toggle");
  const wrap=document.getElementById("notif-time-wrap");
  const on=btn.textContent.includes("An");
  btn.textContent=on?"🔕 Aus":"🔔 An";
  btn.style.color=on?"#6b7280":"#14b8a6";
  btn.style.borderColor=on?"var(--border)":"#14b8a6";
  btn.style.background=on?"var(--bg2)":"#0a1a1a";
  wrap.style.display=on?"none":"flex";
}

function collectRepeatFromDOM(){
  const typeEl=document.getElementById("_repeat-type");
  // fallback: scan button states
  const type=typeEl?.value||["daily","weekdays","interval","manual"].find(t=>{
    const b=document.getElementById(`rtype-${t}`);
    return b&&(b.style.color.includes("accent")||b.style.borderColor.includes("accent"));
  })||"daily";
  const days=[];
  DAYS_DE.forEach((_,i)=>{
    const b=document.getElementById(`rday-${i}`);
    if(b&&(b.dataset.on==="1"||(b.style.borderColor.includes("accent")&&b.dataset.on!=="0")))days.push(i);
  });
  const interval=Math.max(2,parseInt(document.getElementById("repeat-interval-val")?.value)||2);
  const notifBtn=document.getElementById("notif-toggle");
  const notifOn=notifBtn&&(notifBtn.textContent.includes("An")||notifBtn.dataset.on==="1");
  const notifTime=document.getElementById("notif-time")?.value||"09:00";
  return{repeat:{type,days,interval,lastReset:null},notif:{enabled:!!notifOn,time:notifTime}};
}

function submitAddSheet(){
  const title=document.getElementById("add-title")?.value;
  const cat=document.getElementById("add-cat")?.value;
  const dc=document.getElementById("add-dc")?.value;
  const dngId=document.getElementById("add-dungeon")?.value||null;
  if(!title?.trim()){float("⚠️ Bitte Titel eingeben!","#ef4444");return;}
  const{repeat,notif}=collectRepeatFromDOM();
  const q={id:Date.now(),title:title.trim(),cat,xp:20,gold:7,done:false,desc:"Eigene Quest",dc:parseInt(dc)||10,repeat,notif};
  if(dngId){S.dungeons=S.dungeons.map(d=>d.id===dngId?{...d,quests:[...d.quests,q]}:d);}
  else S.quests.push(q);
  scheduleQuestNotifications();
  ADD_SHEET_OPEN=false;EDIT_QUEST_ID=null;
  TAB="quests";QUEST_SUBTAB=dngId?"dungeons":"quests";
  float("✓ Quest hinzugefügt!","#22c55e");
  saveState();render();
}

function submitEditQuest(id,dungeonId){
  const title=document.getElementById("add-title")?.value;
  const cat=document.getElementById("add-cat")?.value;
  const dc=document.getElementById("add-dc")?.value;
  if(!title?.trim()){float("⚠️ Bitte Titel eingeben!","#ef4444");return;}
  const{repeat,notif}=collectRepeatFromDOM();
  const patch=q=>q.id==id?{...q,title:title.trim(),cat,dc:parseInt(dc)||10,repeat,notif}:q;
  if(dungeonId)S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:d.quests.map(patch)}:d);
  else S.quests=S.quests.map(patch);
  scheduleQuestNotifications();
  ADD_SHEET_OPEN=false;EDIT_QUEST_ID=null;
  float("✏️ Quest gespeichert!","#14b8a6");
  saveState();render();
}

function submitAddSheet(){
  const title=document.getElementById("add-title")?.value;
  const cat=document.getElementById("add-cat")?.value;
  const dc=document.getElementById("add-dc")?.value;
  const dngId=document.getElementById("add-dungeon")?.value||null;
  if(!title?.trim()){float("⚠️ Bitte Titel eingeben!","#ef4444");return;}
  addNewQuest(title,cat,dc,dngId);
  ADD_SHEET_OPEN=false;
  TAB="quests";QUEST_SUBTAB=dngId?"dungeons":"quests";
  float("✓ Quest hinzugefügt!","#22c55e");
}

function submitNewDungeon(){
  const icon=document.getElementById("dng-icon")?.value||"🏰";
  const name=document.getElementById("dng-name")?.value?.trim();
  const story=document.getElementById("dng-story")?.value?.trim()||"Ein mysteriöser Ort.";
  const bossName=document.getElementById("dng-boss-name")?.value?.trim()||"Unbekannter Boss";
  const bossHp=parseInt(document.getElementById("dng-boss-hp")?.value)||100;
  const bossDC=parseInt(document.getElementById("dng-boss-dc")?.value)||12;
  const bossAtk=parseInt(document.getElementById("dng-boss-atk")?.value)||20;
  if(!name){float("⚠️ Dungeon-Name fehlt!","#ef4444");return;}
  const id="d"+Date.now();
  const newDng={
    id,name,icon,story,quests:[],bossKilled:false,dc:bossDC,
    boss:{name:bossName,icon:"👹",hp:bossHp,maxHp:bossHp,atk:bossAtk,dc:bossDC,
      reward:{xp:Math.floor(bossHp*1.2),gold:Math.floor(bossHp*.6),rarity:"rare"},
      taunt:["Du wirst mich nicht besiegen!","Gib auf!","Nie!"]},
  };
  S.dungeons.push(newDng);
  ADD_SHEET_OPEN=false;TAB="quests";QUEST_SUBTAB="dungeons";
  addLog(`🏰 Dungeon erstellt: ${name}`);
  float(`🏰 ${name} erschaffen!`,"#fbbf24");
  saveState();render();
}

function submitEditDungeon(id){
  const icon=document.getElementById("dng-icon")?.value||"🏰";
  const name=document.getElementById("dng-name")?.value?.trim();
  const story=document.getElementById("dng-story")?.value?.trim();
  const bossName=document.getElementById("dng-boss-name")?.value?.trim();
  const bossHp=parseInt(document.getElementById("dng-boss-hp")?.value)||100;
  const bossDC=parseInt(document.getElementById("dng-boss-dc")?.value)||12;
  const bossAtk=parseInt(document.getElementById("dng-boss-atk")?.value)||20;
  if(!name){float("⚠️ Dungeon-Name fehlt!","#ef4444");return;}
  S.dungeons=S.dungeons.map(d=>d.id===id?{
    ...d,name,icon,story:story||d.story,
    boss:{...d.boss,name:bossName||d.boss.name,maxHp:bossHp,hp:Math.min(d.boss.hp,bossHp),atk:bossAtk,dc:bossDC,
      reward:{xp:Math.floor(bossHp*1.2),gold:Math.floor(bossHp*.6),rarity:d.boss.reward.rarity}},
  }:d);
  EDIT_DUNGEON_ID=null;ADD_SHEET_OPEN=false;
  float(`✏️ ${name} aktualisiert!`,"#14b8a6");
  saveState();render();
}

function deleteDungeon(id){
  const dng=S.dungeons.find(d=>d.id===id);
  if(!dng)return;
  // Nur löschbar wenn kein Boss noch aktiv kämpft
  S.dungeons=S.dungeons.filter(d=>d.id!==id);
  EDIT_DUNGEON_ID=null;ADD_SHEET_OPEN=false;
  addLog(`🗑️ Dungeon gelöscht: ${dng.name}`);
  float(`🗑️ ${dng.name} gelöscht`,"#6b7280");
  saveState();render();
}
function deleteQuest(id,dungeonId){
  MODAL={type:"confirmDelete",data:{id,dungeonId}};render();
}
function unequipSlot(slot){
  S.character.equipment={...S.character.equipment,[slot]:null};
  float("↩ Abgelegt","#6b7280");
  saveState();render();
}
function closeModal(){MODAL=null;render();}
function openArchetypePicker(){MODAL={type:"archetypePicker"};render();}
function chooseArchetype(key){
  S.chosenArchetype=key||null;
  const arch=key?ARCHETYPES[key]:getArchetype();
  saveState();MODAL=null;
  float((arch?.icon||"⚡")+" Archetyp: "+(arch?.name||"Auto"),arch?.color||"#a78bfa");
  render();
}
function confirmDelete(id,dungeonId){
  if(dungeonId){S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:d.quests.filter(q=>q.id!=id)}:d);}
  else S.quests=S.quests.filter(q=>q.id!=id);
  MODAL=null;saveState();float("🗑️ Quest gelöscht","#6b7280");render();
}
function tutPage(p){MODAL={type:"tutorial",data:{page:p}};render();}
function doQuest(id,dungeonId){completeQuestById(dungeonId?parseInt(id)||id:parseInt(id)||id,dungeonId||null);}
function undoQuest(id,dungeonId){
  if(dungeonId){S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:d.quests.map(q=>q.id==id?{...q,done:false}:q)}:d);}
  else S.quests=S.quests.map(q=>q.id==id?{...q,done:false}:q);
  saveState();render();
}
function toggleDungeon(id){
  const el=document.getElementById("dng-"+id);
  if(el)el.style.display=el.style.display==="none"?"block":"none";
}
function startBoss(id){
  const dng=S.dungeons.find(d=>d.id===id);
  if(!dng||dng.bossKilled)return;
  BOSS_STATE={dungeonId:id,bossHp:dng.boss.maxHp,playerHp:S.character.hp,log:[],phase:"idle",lastRoll:null,rolling:false};
  MODAL={type:"boss",data:{dungeonId:id}};render();
}
function equipItem(uid){
  const item=S.inventory.find(i=>i.uid==uid);
  if(!item)return;
  const check=canEquipItem(item);
  if(!check.ok){float("❌ "+check.reason,"#ef4444");return;}
  const arch=getArchetype();
  if(item.archReq&&!item.archReq.includes(arch.name)){
    float("⚠️ Empfohlen für: "+item.archReq[0]+". Du kannst es trotzdem tragen.","#f59e0b");
  }
  S.character.equipment={...S.character.equipment,[item.slot]:{...item}};
  float(item.icon+" "+item.name+" ausgerüstet!",RARITIES[item.rarity].color);
  addLog("⚔️ Ausgerüstet: "+item.name);
  saveState();render();
}
function equipPet(petId){
  S.character.equippedPet=petId;
  const p=PETS.find(x=>x.id===petId);
  if(p)float(p.icon+" "+p.name+" begleitet dich!",RARITIES[p.rarity].color);
  saveState();render();
}
function buyShopItem(id){
  const item=SHOP_ITEMS.find(i=>i.id===id);
  if(!item||S.character.gold<item.cost)return;
  S.character.gold-=item.cost;
  const e=item.eff;
  if(e==="hp+30")S.character.hp=Math.min(S.character.hp+30,S.character.maxHp);
  if(e==="hp+80")S.character.hp=Math.min(S.character.hp+80,S.character.maxHp);
  if(e==="goldboost")S.buffs.goldboost=1.5;
  if(e==="dicemod+3")S.buffs.dicemod=(S.buffs.dicemod||0)+3;
  if(e==="streakshield")S.buffs.streakshield=true;
  if(e==="maxhp+20"){S.character.maxHp+=20;S.character.hp+=20;}
  if(e==="xp+50")gainXPGold(50,0);
  if(e==="attr:STR+1")S.baseAttrs.STR++;
  if(e==="attr:INT+1")S.baseAttrs.INT++;
  if(e==="attr:WIS+1")S.baseAttrs.WIS++;
  if(e.startsWith("loot:")){const t=e.split(":")[1];const ni=randomItemByTier(t);if(ni)S.inventory.push({...ni,uid:Date.now()});}
  if(e.startsWith("pet:")){const minR=e.split(":")[1];const np=randomPetByMinRarity(minR);if(np&&!S.zoo.find(p=>p.id===np.id))S.zoo.push({...np,petLevel:1});}
  addLog("🛒 Gekauft: "+item.name);
  saveState();float("🛒 "+item.name,"#fbbf24");render();
}
window.startBoss=startBoss;
window.craft=craft;
window.buyRotatingItem=buyRotatingItem;
window.buyMatPack=buyMatPack;
window.sendExpedition=sendExpedition;
window.collectExpedition=collectExpedition;
window.petInteract=petInteract;
window.buyTalent=buyTalent;
window.doPrestige=doPrestige;
window.buyBuilding=buyBuilding;
window.hireNPC=hireNPC;
window.fireNPC=fireNPC;
window.exportSave=exportSave;
window.importSave=importSave;
window.deleteSave=deleteSave;
window.setZooTab=t=>{ZOO_SUBTAB=t;render();};
window.setShopTab=t=>{SHOP_SUBTAB=t;render();};
window.setCraftProf=p=>{CRAFT_PROF=p;render();};
window.applyTheme=applyTheme;
window.setHeimsattTab=t=>{HEIMSTATT_SUBTAB=t;render();};
window.setProfilTab=t=>{PROFIL_SUBTAB=t;render();};
window.setAddTab=t=>{ADD_SHEET_TAB=t;EDIT_DUNGEON_ID=null;render();};
window.setEditDungeon=id=>{EDIT_DUNGEON_ID=id;render();};
window.submitNewDungeon=submitNewDungeon;
window.submitEditDungeon=submitEditDungeon;
window.deleteDungeon=deleteDungeon;

// Scene click → story
document.addEventListener("click",e=>{
  if(e.target.closest("#home-scene")){
    const hb=getHomeBase();
    float(`${hb.icon} ${hb.story}`,"#a78bfa");
  }
});

// PWA Service Worker
if('serviceWorker' in navigator){
  const sw=`self.addEventListener('install',e=>e.waitUntil(caches.open('rpg-v1').then(c=>c.addAll(['.']))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request))));`;
  const blob=new Blob([sw],{type:'application/javascript'});
  navigator.serviceWorker.register(URL.createObjectURL(blob)).catch(()=>{});
}

// PWA Manifest
const manifest={name:"Buff Life – Habit Tracker",short_name:"Buff Life",start_url:".",display:"standalone",background_color:"#08060f",theme_color:"#08060f",description:"Gamifiziere dein Leben mit DnD & RPG Mechaniken",icons:[{src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2308060f"/><text y=".9em" font-size="80" x="10">⚔️</text></svg>'),sizes:"192x192",type:"image/svg+xml"},{src:"data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="%2308060f"/><text y=".9em" font-size="80" x="10">⚔️</text></svg>'),sizes:"512x512",type:"image/svg+xml"}]};
const mlink=document.createElement("link");
mlink.rel="manifest";
mlink.href="data:application/manifest+json,"+encodeURIComponent(JSON.stringify(manifest));
document.head.appendChild(mlink);

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════

// Startup Item & Pet Generator
// Runs once on first setup completion — generates a starter kit
function runStarterGenerator(){
  if(S.starterGenDone)return;
  S.starterGenDone=true;

  // Generate 3 starter items across common/uncommon
  const starterTiers=["normal","normal","good"];
  starterTiers.forEach(tier=>{
    const item=randomItemByTier(tier);
    if(item)S.inventory.push({...item,uid:Date.now()+Math.random()});
  });

  // Generate 2 random starter pets (common/uncommon range)
  const starterPetRarities=["common","uncommon"];
  starterPetRarities.forEach(minR=>{
    const pet=randomPetByMinRarity(minR);
    if(pet&&!S.zoo.find(p=>p.id===pet.id))S.zoo.push({...pet,petLevel:1});
  });

  // Bonus starting gold
  S.character.gold+=20;

  addLog("🎒 Starter-Kit erhalten: 3 Items, 2 Haustiere, +20🪙");
  saveState();

  // Show a welcome modal after setup
  setTimeout(()=>{
    MODAL={type:"starterKit"};render();
  },400);
}

// Hook into finishSetup to run generator
const _origFinish=window.finishSetup;
window.finishSetup=()=>{
  _origFinish();
  setTimeout(()=>{if(S.setup&&!S.starterGenDone)runStarterGenerator();},100);
};

// Handle starterKit modal in render
const _origRender=render;
window._renderStarterKit=()=>{
  const app=document.getElementById("app");
  if(!app)return;
  app.innerHTML=`${buildShell()}<div class="overlay" onclick="closeModal()"><div class="modal" onclick="event.stopPropagation()" style="text-align:center">
    <div style="font-size:40px;margin-bottom:8px">🎒</div>
    <div class="cinzel" style="font-size:17px;color:var(--gold);font-weight:900;margin-bottom:4px">STARTER-KIT!</div>
    <div style="font-size:12px;color:#9ca3af;margin-bottom:14px;font-style:italic">Die Götter beschenken dich zum Aufbruch.</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;text-align:left">
      ${S.inventory.slice(0,3).map(i=>`<div style="display:flex;align-items:center;gap:8px;background:#0d0b1e;border-radius:8px;padding:7px 10px;border:1px solid ${RARITIES[i.rarity].border}">
        <span style="font-size:20px">${i.icon}</span>
        <div><div class="cinzel" style="font-size:11px;color:${RARITIES[i.rarity].color}">${i.name}</div><div style="font-size:9px;color:#6b7280">${Object.entries(i.stats).map(([k,v])=>`${k}+${v}`).join(" ")}</div></div>
      </div>`).join("")}
      ${S.zoo.slice(0,2).map(p=>{const def=PETS.find(x=>x.id===p.id)||p;return`<div style="display:flex;align-items:center;gap:8px;background:#0d0b1e;border-radius:8px;padding:7px 10px;border:1px solid ${RARITIES[def.rarity].border}">
        <span style="font-size:20px">${def.evo[0]}</span>
        <div><div class="cinzel" style="font-size:11px;color:${RARITIES[def.rarity].color}">${def.name}</div><div style="font-size:9px;color:#6b7280">${def.ability}</div></div>
      </div>`;}).join("")}
      <div style="background:#0d0b1e;border-radius:8px;padding:7px 10px;border:1px solid #92400e;font-size:12px;color:var(--gold)">🪙 +20 Startgold</div>
    </div>
    <button onclick="closeModal()" class="btn-primary">Abenteuer beginnen! →</button>
  </div></div>`;
};

if(!S){S=getInitState();}
migrateState();
initTheme();
PB_ATTRS={...S.baseAttrs};

// Override render to handle starterKit modal
const __baseRender=render;
window.render=function(){
  if(MODAL?.type==="starterKit"){window._renderStarterKit();return;}
  __baseRender();
};
render=window.render;

// Stub — overridden by Capacitor module in app
function scheduleQuestNotifications(){}

// Expose new functions
window.openEditQuest=openEditQuest;
window.submitEditQuest=submitEditQuest;
window.setRepeatType=setRepeatType;
window.toggleRepeatDay=toggleRepeatDay;
window.toggleNotif=toggleNotif;
window.scheduleQuestNotifications=scheduleQuestNotifications;

render();