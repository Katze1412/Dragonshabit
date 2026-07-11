'use strict';
function renderHeader(){
  const attrs=computedAttrs();
  const ch=S.character;
  const hb=getHomeBase();
  const pet=ch.equippedPet?PETS.find(p=>p.id===ch.equippedPet):null;
  const petEvo=pet?pet.evo[Math.min(Math.floor(ch.level/10),2)]:"";
  const xpPct=Math.min((ch.xp/ch.xpToNext)*100,100);
  const hpPct=Math.min((ch.hp/ch.maxHp)*100,100);
  const hpCol=hpPct>60?"#22c55e":hpPct>30?"#f59e0b":"#ef4444";
  return`<div id="header">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px">
        <div style="font-size:22px">${hb.icon}</div>
        <div>
          <div class="cinzel" style="font-size:16px;font-weight:900;color:#c4b5fd;line-height:1">
            ${(S.prestige||0)>0?`<span style="font-size:12px;margin-right:2px">${PRESTIGE_ICONS[Math.min(S.prestige,6)]}</span>`:""}${ch.name}${petEvo?` <span style="font-size:13px">${petEvo}${S.expeditions?.[ch.equippedPet]?"⏳":""}</span>`:""}
          </div>
          <div style="font-size:9px;color:var(--purple);font-style:italic">${getLevelTitle(ch.level)} · Lv ${ch.level} · ${hb.name}</div>
          <div style="margin-top:2px">
            ${(()=>{const a=getArchetype();return`<span style="font-size:9px;color:${a.color};background:${a.color}22;border:1px solid ${a.color}44;border-radius:99px;padding:1px 7px;font-family:'Cinzel',serif">${a.icon} ${a.name}</span>`;})()}
          </div>
        </div>
      </div>
      <div style="text-align:right;display:flex;flex-direction:column;gap:1px">
        <div style="font-size:13px;color:var(--gold);font-weight:700">🪙 ${ch.gold}</div>
        <div style="font-size:9px;color:#f59e0b">🔥 Streak ${ch.streak}</div>
        ${(S.buffs?.dicemod||0)>0?`<div style="font-size:9px;color:var(--purple2)">🎲 +${S.buffs.dicemod}</div>`:""}
        ${(S.talentPoints||0)>0?`<div style="font-size:9px;color:#fbbf24">🌟 ${S.talentPoints} Talent</div>`:""}
        <div style="display:flex;gap:5px;align-items:center">
          <div id="sync-status-dot" onclick="MODAL={type:'sync'};render()" title="Cloud Sync" style="width:8px;height:8px;border-radius:50%;background:#374151;cursor:pointer;margin-top:2px;flex-shrink:0"></div>
          <button onclick="MODAL={type:'settings'};render()" style="background:none;border:none;color:#374151;font-size:14px;padding:2px;cursor:pointer">⚙️</button>
        </div>
      </div>
    </div>
    <div style="margin-bottom:5px">
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--purple2);margin-bottom:2px"><span>${ch.xp}/${ch.xpToNext} XP</span><span>→ Lv${ch.level+1}</span></div>
      <div class="bar-wrap" style="height:6px"><div class="bar-fill xp-bar" style="width:${xpPct}%"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:9px;color:#9ca3af;margin-bottom:2px"><span>❤️ HP</span><span style="color:${hpCol}">${ch.hp}/${ch.maxHp}</span></div>
      <div class="bar-wrap" style="height:4px"><div class="bar-fill" style="width:${hpPct}%;background:${hpCol};box-shadow:0 0 5px ${hpCol}88"></div></div>
    </div>
  </div>`;
}

function renderNav(){
  const tabs=[["quests","⚔️","Quests"],["zoo","🐾","Zoo"],["gear","🎒","Gear"],["shop","🛒","Markt"],["heimstatt","🏰","Heimstatt"],["profil","👤","Profil"]];
  const pts=S.talentPoints||0;
  return`<div id="nav">
    ${tabs.map(([t,ic,lb])=>`<button class="nav-btn${TAB===t||( t==="quests"&&TAB==="dungeons")?" active":""}" onclick="setTab('${t}')" style="padding:2px 4px">${ic}<span>${lb}${t==="profil"&&pts>0?" ●":""}</span></button>`).join("")}
  </div>
  ${(TAB==="quests"||TAB==="dungeons")?`<button id="fab" onclick="openAddSheet()">＋</button>`:""}`;
}

function renderAttrs(){
  const attrs=computedAttrs();
  return`<div class="card" style="padding:10px 12px">
    <div class="attr-grid">
      ${Object.entries(ATTRS).map(([k,a])=>{
        const v=attrs[k]||8;const mod=attrMod(v);
        return`<div class="attr-cell" style="border-color:${a.color}22">
          <div style="font-size:14px">${a.icon}</div>
          <div class="cinzel" style="font-size:8px;color:${a.color};font-weight:700">${k}</div>
          <div class="cinzel" style="font-size:15px;color:#e9d5ff;font-weight:700">${v}</div>
          <div style="font-size:9px;color:${mod>=0?"#22c55e":"#ef4444"}">${mod>=0?"+":""}${mod}</div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
}

function rarityBadge(r,small){
  const rd=RARITIES[r];
  return`<span class="badge" style="color:${rd.color};background:${rd.glow};border:1px solid ${rd.border};font-size:${small?8:9}px">${rd.label}</span>`;
}

function renderQuestCard(q,dungeonId){
  const col=CAT_COLOR[q.cat];
  const attrs=computedAttrs();
  const mod=attrMod(attrs[CAT_ATTR[q.cat]]||8);
  const dId=dungeonId||"";
  const active=questIsActiveToday(q);
  const rLabel=repeatLabel(q);
  const hasNotif=q.notif?.enabled;
  return`<div class="quest-card${q.done?" done":""}" style="border-color:${q.done?"var(--border)":active?col+"55":"var(--border)"};opacity:${active?1:.45}">
    <div class="quest-header">
      <div style="flex:1">
        <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
          <div class="cinzel" style="font-size:var(--fs-sm);color:${q.done?"#4b5563":"#e9d5ff"};font-weight:600">${q.title}</div>
          ${!active?`<span style="font-size:9px;color:#4b5563;background:#111;border-radius:99px;padding:1px 6px">heute inaktiv</span>`:""}
        </div>
        <div style="font-size:var(--fs-xs);color:#6b7280;margin-top:1px">${q.desc}</div>
        <div style="display:flex;gap:5px;margin-top:5px;flex-wrap:wrap;align-items:center">
          <span class="badge" style="color:var(--accent3);background:var(--accent-bg)">+${q.xp}XP</span>
          <span class="badge" style="color:var(--gold);background:#1c1500">+${q.gold}🪙</span>
          <span class="badge" style="color:${col};background:${col}22">${CAT_LABEL[q.cat]}</span>
          <span class="badge" style="color:#6b7280;background:#111">DC${q.dc} ${mod>=0?"+":""}${mod}</span>
          <span class="badge" style="color:#6b7280;background:#111;border:1px solid #222">🔁 ${rLabel}</span>
          ${hasNotif?`<span class="badge" style="color:#14b8a6;background:#0a1a1a;border:1px solid #14b8a644">🔔 ${q.notif.time}</span>`:""}
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0">
        ${q.done
          ?`<button onclick="undoQuest(${q.id},'${dId}')" style="background:#1f2937;border:1px solid #374151;color:#6b7280;border-radius:7px;padding:4px 9px;font-size:var(--fs-xs)">↩</button>`
          :`<button onclick="doQuest(${q.id},'${dId}')" style="background:linear-gradient(135deg,var(--accent1),var(--accent2));border:none;border-radius:8px;padding:7px 12px;color:#fff;font-size:var(--fs-lg);box-shadow:0 0 10px var(--accent-glow)" ${!active?"disabled style='opacity:.4'":''}">🎲</button>`
        }
        <div style="display:flex;gap:3px">
          <button onclick="openEditQuest(${q.id},'${dId}')" style="background:transparent;border:none;color:#4b5563;font-size:12px;padding:2px 5px;line-height:1" title="Bearbeiten">✏️</button>
          <button onclick="deleteQuest(${q.id},'${dId}')" style="background:transparent;border:none;color:#374151;font-size:13px;padding:2px 5px;line-height:1" title="Löschen">✕</button>
        </div>
      </div>
    </div>
  </div>`;
}

// Sub-tab state for quests view
let QUEST_SUBTAB="quests"; // "quests" | "dungeons"

// TAB: QUESTS (with sub-tab)
function renderQuests(){
  let h=buildScene();

  // Sub-tab switcher
  h+=`<div style="display:flex;gap:6px;margin-bottom:12px">
    <button onclick="setQuestSubtab('quests')" style="flex:1;padding:8px;border-radius:9px;border:none;background:${QUEST_SUBTAB==='quests'?'linear-gradient(90deg,#4f46e5,var(--purple))':'var(--bg2)'};color:${QUEST_SUBTAB==='quests'?"#fff":"#6b7280"};font-family:'Cinzel',serif;font-size:11px;font-weight:600;transition:all .2s;box-shadow:${QUEST_SUBTAB==='quests'?'0 0 10px #7c3aed44':'none'}">⚔️ Quests</button>
    <button onclick="setQuestSubtab('dungeons')" style="flex:1;padding:8px;border-radius:9px;border:none;background:${QUEST_SUBTAB==='dungeons'?'linear-gradient(90deg,#92400e,#f59e0b)':'var(--bg2)'};color:${QUEST_SUBTAB==='dungeons'?"#000":"#6b7280"};font-family:'Cinzel',serif;font-size:11px;font-weight:600;transition:all .2s;box-shadow:${QUEST_SUBTAB==='dungeons'?'0 0 10px #f59e0b44':'none'}">🏰 Dungeons</button>
  </div>`;

  if(QUEST_SUBTAB==="quests"){
    h+=renderAttrs();
    // Daily event banner
    if(S.dailyEvent){
      const ev=S.dailyEvent;
      h+=`<div style="border:1px solid ${ev.color}44;border-radius:10px;padding:8px 12px;margin-bottom:10px;background:${ev.color}11;display:flex;gap:8px;align-items:center">
        <div style="font-size:20px">${ev.icon}</div>
        <div>
          <div class="cinzel" style="font-size:10px;color:${ev.color};font-weight:700">${ev.title}</div>
          <div style="font-size:9px;color:#6b7280">${ev.desc}</div>
        </div>
      </div>`;
    }
    let hasAny=false;
    Object.keys(CAT_LABEL).forEach(cat=>{
      const qs=S.quests.filter(q=>q.cat===cat);
      if(!qs.length)return;
      hasAny=true;
      h+=`<div style="margin-bottom:14px">
        <div class="section-title" style="color:${CAT_COLOR[cat]}">${CAT_LABEL[cat].toUpperCase()}</div>
        ${qs.map(q=>renderQuestCard(q,null)).join("")}
      </div>`;
    });
    if(!hasAny)h+=`<div style="text-align:center;padding:30px 0;color:#374151;font-style:italic">Noch keine Quests — tippe ＋ um welche hinzuzufügen!</div>`;

    // Inline quick-add form
    h+=`<div class="card" style="border-style:dashed;border-color:#2d2a6e;margin-top:4px">
      <div class="cinzel" style="font-size:9px;color:var(--purple);letter-spacing:2px;margin-bottom:10px">＋ QUEST HINZUFÜGEN</div>
      <input class="input-field" id="iq-title" placeholder="Quest-Titel..." style="outline:none">
      <div style="display:flex;gap:6px;margin-bottom:8px">
        <select class="select-field" id="iq-cat" style="margin-bottom:0;flex:1;outline:none">
          ${Object.entries(CAT_LABEL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}
        </select>
        <input type="number" class="input-field" id="iq-dc" value="10" min="4" max="20" style="margin-bottom:0;width:64px;outline:none" placeholder="DC">
      </div>
      <button onclick="submitInlineAdd()" class="btn-primary" style="padding:9px">⚔️ Quest annehmen</button>
    </div>`;

    h+=`<button onclick="resetDay()" style="width:100%;padding:9px;border-radius:9px;background:transparent;border:1px solid var(--border);color:#4b5563;font-size:11px;margin-top:8px;margin-bottom:16px">🌙 Neuen Tag starten</button>`;
  } else {
    h+=renderDungeons();
  }
  return h;
}

function renderDungeons(){
  let h=`<div class="card" style="font-size:11px;color:#6b7280;font-style:italic;padding:8px 12px;margin-bottom:10px">
    📖 Dungeons sind Ordner mit eigenen Quests. Erledige alle → Boss erscheint.
  </div>`;
  S.dungeons.forEach(dng=>{
    const done=dng.quests.filter(q=>q.done).length;
    const total=dng.quests.length;
    const bossReady=total>0&&done===total&&!dng.bossKilled;
    const pct=total?Math.min((done/total)*100,100):0;
    h+=`<div class="card" style="border-color:${dng.bossKilled?"#166534":bossReady?"#fbbf2466":"var(--border)"}">
      <div onclick="toggleDungeon('${dng.id}')" style="display:flex;justify-content:space-between;align-items:flex-start;cursor:pointer">
        <div>
          <div class="cinzel" style="font-size:13px;color:${dng.bossKilled?"#4ade80":"#e9d5ff"};font-weight:700">${dng.icon} ${dng.name}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:2px;font-style:italic">${dng.story.substring(0,70)}...</div>
          <div style="font-size:10px;color:var(--purple2);margin-top:3px">${done}/${total} Quests · Boss: ${dng.boss.name}</div>
          ${total>0?`<div class="bar-wrap" style="height:4px;margin-top:5px"><div class="bar-fill" style="width:${pct}%;background:var(--purple)"></div></div>`:""}
        </div>
        <div style="font-size:18px;margin-left:8px">${dng.bossKilled?"🏆":bossReady?"⚡":"▼"}</div>
      </div>
      <div id="dng-${dng.id}" style="display:none;margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
        ${dng.quests.map(q=>renderQuestCard(q,dng.id)).join("")}
        ${dng.quests.length===0?`<div style="color:#374151;font-style:italic;text-align:center;padding:8px">Keine Quests — tippe ＋ oben rechts!</div>`:""}
        ${bossReady?`<button class="btn-gold" style="margin-top:8px;animation:pulse .8s infinite" onclick="startBoss('${dng.id}')">⚔️ BOSS: ${dng.boss.icon} ${dng.boss.name}</button>`:""}
      </div>
    </div>`;
  });
  return h;
}

// TAB: ZOO
let ZOO_SUBTAB="pets";
function renderZoo(){
  let h=`<div class="sub-tab-row">
    <button onclick="setZooTab('pets')" class="sub-tab-btn" style="${ZOO_SUBTAB==='pets'?'background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;':''}" >🐾 Tiere (${S.zoo.length})</button>
    <button onclick="setZooTab('expedition')" class="sub-tab-btn" style="${ZOO_SUBTAB==='expedition'?'background:linear-gradient(90deg,#0f766e,#14b8a6);color:#fff;':''}" >🗺️ Expedition</button>
  </div>`;
  h+=ZOO_SUBTAB==="pets"?renderZooPets():renderZooExpedition();
  return h;
}
function renderZooPets(){
  const ch=S.character;
  if(!S.zoo.length)return`<div style="text-align:center;padding:40px 0;color:#374151"><div style="font-size:48px;margin-bottom:8px">🐾</div><div style="font-style:italic">Noch keine Haustiere — würfle Nat 20 oder kauf ein Ei!</div></div>`;
  let h="";
  S.zoo.forEach(pet=>{
    const def=PETS.find(p=>p.id===pet.id)||pet;
    const eIdx=Math.min(Math.floor(S.character.level/10),2);
    const equipped=ch.equippedPet===pet.id;
    const onExp=!!S.expeditions?.[pet.id];
    const r=RARITIES[def.rarity];
    const effectStr=Object.entries(def.effect).map(([k,v])=>k+" +"+v).join(" · ");
    h+='<div class="card" style="border-color:'+(onExp?"#14b8a6":equipped?r.color:"var(--border)")+';box-shadow:'+(equipped?"0 0 14px "+r.glow:"none")+';'+(onExp?"animation:expPulse 2s infinite;":'')+'">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start">'
      +'<div style="display:flex;gap:10px;align-items:center">'
      +'<div style="font-size:32px">'+def.evo[eIdx]+'</div>'
      +'<div><div class="cinzel" style="font-size:12px;color:'+r.color+';font-weight:700">'+def.name+'</div>'
      +rarityBadge(def.rarity)
      +'<div style="font-size:10px;color:#6b7280;margin-top:3px">'+def.ability+'</div>'
      +'<div style="font-size:9px;color:'+(onExp?"#14b8a6":"#22c55e")+'margin-top:2px">'+(onExp?"⏳ Auf Expedition":effectStr)+'</div>'
      +'<div style="font-size:9px;color:#4b5563;font-style:italic;margin-top:1px">'+def.lore+'</div>'
      +'</div></div>'
      +(onExp
        ?'<span style="font-size:9px;color:#14b8a6;background:#0a1a1a;border-radius:6px;padding:3px 7px;border:1px solid #14b8a644">🗺️ Unterwegs</span>'
        :'<button onclick="equipPet(\''+def.id+'\')" style="padding:5px 10px;border-radius:8px;border:1px solid '+(equipped?r.color:"#2d2a6e")+';background:'+(equipped?r.color+"22":"var(--bg)")+';color:'+(equipped?r.color:"#6b7280")+';font-size:10px;font-weight:600;flex-shrink:0">'+(equipped?"✓ Aktiv":"Ausrüsten")+'</button>'
      )
      +'</div></div>';
  });
  return h;
}
function renderZooExpedition(){
  if(!S.expeditions)S.expeditions={};
  if(!S.petAffection)S.petAffection={};
  const mats=S.materials||{ore:0,herbs:0,magicDust:0};
  let h=`<div class="card" style="padding:8px 12px;margin-bottom:10px">
    <div class="section-title" style="margin-bottom:5px">MATERIALIEN</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${Object.entries(MATERIALS).map(([k,m])=>`<span class="mat-chip" style="color:${m.color};background:${m.color}22;border-color:${m.color}44">${m.icon} ${mats[k]||0} ${m.name}</span>`).join("")}
    </div>
  </div>`;
  if(!S.zoo.length){h+=`<div style="text-align:center;padding:30px;color:#374151;font-style:italic">Noch keine Haustiere vorhanden.</div>`;return h;}
  S.zoo.forEach(pet=>{
    const def=PETS.find(p=>p.id===pet.id)||pet;
    const r=RARITIES[def.rarity];
    const exp=getExpStatus(pet.id);
    const aff=S.petAffection?.[pet.id]||{level:0,lastDate:null};
    const today=new Date().toDateString();
    h+=`<div class="card" style="border-color:${exp?"#14b8a6":"var(--border)"};${exp?"animation:expPulse 2s infinite;":""}">`;
    h+=`<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px">`;
    h+=`<div style="font-size:22px">${def.evo[0]}</div>`;
    h+=`<div style="flex:1"><div class="cinzel" style="font-size:11px;color:${r.color};font-weight:700">${def.name}</div>`;
    h+=`<div style="display:flex;align-items:center;gap:2px;margin-top:2px">${Array.from({length:5},(_,i)=>`<span style="font-size:11px;color:${i<aff.level?"#f9a8d4":"#2d2a6e"}">♥</span>`).join("")}`;
    if(aff.level>0)h+=`<span style="font-size:9px;color:#a78bfa;margin-left:4px">+${aff.level*5}% Bonus</span>`;
    h+=`</div></div>`;
    if(!exp&&aff.lastDate!==today)h+=`<button onclick="petInteract('${pet.id}')" style="padding:4px 9px;border-radius:7px;border:1px solid #f9a8d466;background:#f9a8d411;color:#f9a8d4;font-size:9px;flex-shrink:0;cursor:pointer">❤️ Tägl.</button>`;
    h+=`</div>`;
    if(exp){
      if(exp.done){
        h+=`<button onclick="collectExpedition('${pet.id}')" class="btn-teal">🎒 Expedition abschließen (${exp.hours}h)</button>`;
      } else {
        const rH=Math.floor(exp.remaining/3600000),rM=Math.floor((exp.remaining%3600000)/60000);
        h+=`<div style="background:#0a1a1a;border:1px solid #14b8a644;border-radius:8px;padding:8px;text-align:center">
          <div style="font-size:10px;color:#14b8a6;font-family:'Cinzel',serif">⏱️ UNTERWEGS (${exp.hours}h)</div>
          <div style="font-size:16px;color:#e9d5ff;font-weight:700;margin-top:2px">${rH}h ${rM}m</div>
          <div style="font-size:9px;color:#4b5563">Passiver Bonus inaktiv</div>
        </div>`;
      }
    } else {
      h+=`<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">`;
      [{h:4,g:"5-15",m:"1 Mat."},{h:8,g:"15-30",m:"1-2 Mat."},{h:12,g:"30-60",m:"2-3 Mat."}].forEach(o=>{
        h+=`<button onclick="sendExpedition('${pet.id}',${o.h})" style="padding:7px 4px;border-radius:8px;border:1px solid #14b8a644;background:#0a1a1a;color:#14b8a6;font-size:10px;font-family:'Cinzel',serif;cursor:pointer;line-height:1.4;text-align:center">
          <div>${o.h}h</div><div style="font-size:8px;color:#6b7280">🪙${o.g}</div><div style="font-size:8px;color:#a78bfa">${o.m}</div>
        </button>`;
      });
      h+=`</div>`;
    }
    h+=`</div>`;
  });
  return h;
}

// TAB: GEAR
function renderGear(){
  const eq=S.character.equipment;
  const slots=["weapon","armor","helmet","ring","trinket"];
  let h='<div class="section-title">AUSGERÜSTET</div><div class="card"><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">';
  slots.forEach(slot=>{
    const item=eq[slot];
    const r=item?RARITIES[item.rarity]:null;
    const statStr=item?Object.entries(item.stats).map(([k,v])=>k+"+"+v).join(" "):"";
    h+='<div style="background:#0d0b1e;border:1px solid '+(r?r.border:"var(--border)")+';border-radius:9px;padding:8px 6px;text-align:center;min-height:64px;position:relative">';
    h+='<div style="font-size:20px">'+(item?item.icon:"○")+'</div>';
    h+='<div class="cinzel" style="font-size:9px;color:'+(r?r.color:"#2d2a6e")+';margin-top:2px">'+(item?item.name:slot)+'</div>';
    if(item){
      h+='<div style="font-size:8px;color:#4b5563;margin-top:1px">'+statStr+'</div>';
      h+='<button onclick="unequipSlot(\''+slot+'\')" title="Ablegen" style="position:absolute;top:3px;right:3px;background:none;border:none;color:#374151;font-size:11px;line-height:1;padding:1px 3px;cursor:pointer">✕</button>';
    }
    h+='</div>';
  });
  h+='</div></div>';
  h+='<div class="section-title" style="margin-top:4px">INVENTAR ('+S.inventory.length+')</div>';
  if(!S.inventory.length){h+=`<div style="color:#374151;font-style:italic;text-align:center;padding:20px">Noch kein Loot!</div>`;return h;}

  // Sort: equipped first, then by rarity desc
  const rOrder=["mystic","legendary","epic","rare","uncommon","common"];
  const sorted=[...S.inventory].sort((a,b)=>{
    const aEq=!!Object.values(eq).find(e=>e&&e.uid===a.uid);
    const bEq=!!Object.values(eq).find(e=>e&&e.uid===b.uid);
    if(aEq!==bEq)return aEq?-1:1;
    return rOrder.indexOf(a.rarity)-rOrder.indexOf(b.rarity);
  });

  // Sell value: 30% of item tier base price
  const SELL_VALUE={common:5,uncommon:12,rare:25,epic:50,legendary:100,mystic:250};

  sorted.forEach((item)=>{
    const r=RARITIES[item.rarity];
    const isEquipped=Object.values(eq).find(e=>e&&e.uid===item.uid);
    const check=canEquipItem(item);
    const arch=getArchetype();
    const isClassItem=item.classItem;
    const matchesClass=!item.archReq||item.archReq.includes(arch.name);
    const reqText=getEquipRequirementText(item);
    const boxShadow=isEquipped?"0 0 10px "+r.glow:"none";
    const borderColor=isEquipped?r.color:check.ok?"#2d2a6e":"#7f1d1d44";
    const sellVal=SELL_VALUE[item.rarity]||5;
    h+=`<div class="card" style="border-color:${borderColor};box-shadow:${boxShadow};opacity:${check.ok?1:.75}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
        <div style="display:flex;gap:8px;align-items:flex-start">
          <div style="font-size:24px;flex-shrink:0">${item.icon}</div>
          <div>
            <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap">
              <div class="cinzel" style="font-size:11px;color:${r.color};font-weight:600">${item.name}</div>
              ${isClassItem?'<span style="font-size:8px;color:#fbbf24;background:#1c1500;border:1px solid #92400e;border-radius:99px;padding:1px 5px">⚔️ Klasse</span>':""}
              ${!matchesClass?'<span style="font-size:8px;color:#f59e0b;background:#1c1000;border-radius:99px;padding:1px 5px">⚠️ Andere Klasse</span>':""}
            </div>
            ${rarityBadge(item.rarity,true)}
            <div style="font-size:9px;color:#6b7280;margin-top:2px">${Object.entries(item.stats).map(([k,v])=>k+" +"+v).join(" · ")}</div>
            ${reqText?'<div style="font-size:8px;color:'+(check.ok?"#4b5563":"#ef4444")+';margin-top:2px">'+(check.ok?"✓":"❌")+" "+reqText+"</div>":""}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end;flex-shrink:0">
          ${isEquipped
            ?'<span style="font-size:12px;color:'+r.color+'">✓</span>'
            :check.ok
              ?'<button onclick="equipItem('+item.uid+')" style="padding:5px 9px;border-radius:7px;border:1px solid '+r.border+';background:'+r.glow+';color:'+r.color+';font-size:9px;font-weight:600">Anlegen</button>'
              :'<div style="font-size:9px;color:#ef4444;text-align:center;max-width:56px">❌ Req.</div>'
          }
          ${!isEquipped
            ?'<button onclick="sellItem('+item.uid+','+sellVal+')" style="padding:3px 7px;border-radius:6px;border:1px solid #374151;background:transparent;color:#6b7280;font-size:9px;cursor:pointer">🪙 '+sellVal+'</button>'
            :''
          }
        </div>
      </div>
    </div>`;
  });
  return h;
}

// TAB: SHOP (sub-tabs: Laden | Marktplatz | Handwerk)
let SHOP_SUBTAB="laden";
let CRAFT_PROF="alchemy";
function renderShop(){
  let h=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
    <div class="section-title" style="margin-bottom:0">🛒 HÄNDLER DES SCHICKSALS</div>
    <div style="font-size:13px;color:var(--gold);font-weight:700">🪙 ${S.character.gold}</div>
  </div>`;
  h+=`<div class="sub-tab-row">
    <button onclick="setShopTab('laden')" class="sub-tab-btn" style="${SHOP_SUBTAB==='laden'?'background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;':''}">🛒 Laden</button>
    <button onclick="setShopTab('markt')" class="sub-tab-btn" style="${SHOP_SUBTAB==='markt'?'background:linear-gradient(90deg,#92400e,var(--gold));color:#000;':''}">🏪 Markt</button>
    <button onclick="setShopTab('handwerk')" class="sub-tab-btn" style="${SHOP_SUBTAB==='handwerk'?'background:linear-gradient(90deg,#0f766e,#14b8a6);color:#fff;':''}">⚗️ Handwerk</button>
  </div>`;
  if(SHOP_SUBTAB==="laden")h+=renderShopLaden();
  else if(SHOP_SUBTAB==="markt")h+=renderShopMarkt();
  else h+=renderShopHandwerk();
  return h;
}
function renderShopLaden(){
  let h="";
  if(S.buffs&&Object.values(S.buffs).some(Boolean)){
    h+=`<div class="card" style="border-color:#166534;background:#0d1a0d;margin-bottom:10px;padding:8px 12px">
      <span style="font-size:9px;color:#22c55e;font-family:'Cinzel',serif;letter-spacing:1px">AKTIVE BUFFS: </span>
      ${S.buffs?.goldboost?`<span class="badge" style="color:var(--gold);background:#1c1500;font-size:10px">💰 Gold ×${S.buffs.goldboost}</span> `:""}
      ${(S.buffs?.dicemod||0)>0?`<span class="badge" style="color:var(--purple2);background:#1e1b4b;font-size:10px">🎲 +${S.buffs.dicemod}</span> `:""}
      ${S.buffs?.streakshield?`<span class="badge" style="color:#22c55e;background:#052e16;font-size:10px">🛡️ Streak-Schutz</span>`:""}
    </div>`;
  }
  [["consumable","⚗️ Verbrauchsgüter"],["lootbox","📦 Lootboxen"],["upgrade","📈 Upgrades"]].forEach(([type,label])=>{
    const items=SHOP_ITEMS.filter(i=>i.type===type);
    h+=`<div class="section-title">${label.toUpperCase()}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
      ${items.map(item=>{const can=S.character.gold>=item.cost;return`<div class="card" style="padding:10px 11px;opacity:${can?1:.5}">
        <div style="font-size:20px;margin-bottom:3px">${item.icon}</div>
        <div class="cinzel" style="font-size:11px;color:#e9d5ff;font-weight:600;line-height:1.3;margin-bottom:2px">${item.name}</div>
        <div style="font-size:9px;color:#6b7280;margin-bottom:7px;line-height:1.4">${item.desc}</div>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:var(--gold);font-weight:700">🪙 ${item.cost}</span>
          <button onclick="buyShopItem('${item.id}')" ${!can?"disabled":""} style="padding:4px 10px;border-radius:7px;border:none;font-size:9px;background:${can?"linear-gradient(90deg,#4f46e5,var(--purple))":"#1f2937"};color:${can?"#fff":"#4b5563"};font-weight:700">${can?"Kaufen":"🔒"}</button>
        </div></div>`;}).join("")}
    </div>`;
  });
  return h;
}
function renderShopMarkt(){
  const rotItems=getRotatingShopItems();
  const today=new Date().toLocaleDateString("de",{day:"numeric",month:"short"});
  let h=`<div class="card" style="border-color:#92400e;background:#1c0a00;margin-bottom:12px;padding:8px 12px">
    <div class="cinzel" style="font-size:9px;color:var(--gold);letter-spacing:2px">🔄 TÄGLICH WECHSELNDE AUSRÜSTUNG — ${today}</div>
    <div style="font-size:9px;color:#6b7280;margin-top:2px">Erneuert sich täglich um Mitternacht</div>
  </div>`;
  rotItems.forEach(item=>{
    const r=RARITIES[item.rarity];const price=RARITY_SHOP_PRICES[item.rarity]||100;
    const can=S.character.gold>=price;const check=canEquipItem(item);
    h+=`<div class="card" style="border-color:${r.border}">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="font-size:28px">${item.icon}</div>
        <div style="flex:1">
          <div class="cinzel" style="font-size:12px;color:${r.color};font-weight:700">${item.name}</div>
          ${rarityBadge(item.rarity,true)}
          <div style="font-size:9px;color:#6b7280;margin-top:2px">${Object.entries(item.stats).map(([k,v])=>k+"+"+v).join(" · ")}</div>
          ${!check.ok?`<div style="font-size:8px;color:#ef4444;margin-top:2px">❌ ${check.reason}</div>`:""}
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:12px;color:var(--gold);font-weight:700;margin-bottom:5px">🪙 ${price}</div>
          <button onclick="buyRotatingItem('${item.id}')" ${!can?"disabled":""} style="padding:5px 10px;border-radius:7px;border:none;font-size:9px;background:${can?"linear-gradient(90deg,#92400e,var(--gold))":"#1f2937"};color:${can?"#000":"#4b5563"};font-weight:700">${can?"Kaufen":"🔒"}</button>
        </div>
      </div>
    </div>`;
  });
  h+=`<div class="section-title" style="margin-top:8px">📦 MATERIALPAKETE</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">
    ${SHOP_MAT_PACKS.map(p=>{const can=S.character.gold>=p.cost;return`<div class="card" style="padding:10px;opacity:${can?1:.5}">
      <div style="font-size:18px;margin-bottom:3px">${p.icon}</div>
      <div class="cinzel" style="font-size:10px;color:#e9d5ff;margin-bottom:2px">${p.name}</div>
      <div style="font-size:9px;color:#6b7280;margin-bottom:6px">${p.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:11px;color:var(--gold);font-weight:700">🪙 ${p.cost}</span>
        <button onclick="buyMatPack('${p.id}')" ${!can?"disabled":""} style="padding:4px 9px;border-radius:6px;border:none;font-size:9px;background:${can?"linear-gradient(90deg,#14b8a6,#0f766e)":"#1f2937"};color:${can?"#fff":"#4b5563"};font-weight:700">${can?"Kaufen":"🔒"}</button>
      </div></div>`;}).join("")}
  </div>`;
  return h;
}
function renderShopHandwerk(){
  const mats=S.materials||{ore:0,herbs:0,magicDust:0};
  let h=`<div class="card" style="margin-bottom:10px;padding:8px 12px">
    <div class="section-title" style="margin-bottom:5px">MATERIALVORRAT</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      ${Object.entries(MATERIALS).map(([k,m])=>`<span class="mat-chip" style="color:${m.color};background:${m.color}22;border-color:${m.color}44">${m.icon} ${mats[k]||0} ${m.name}</span>`).join("")}
    </div>
  </div>`;
  const profLabels={alchemy:"🧪 Alchemie",smithing:"⚒️ Schmieden",scribing:"📜 Schriftkunde"};
  h+=`<div class="sub-tab-row">
    ${Object.entries(profLabels).map(([k,l])=>`<button onclick="setCraftProf('${k}')" class="sub-tab-btn" style="${CRAFT_PROF===k?'background:linear-gradient(90deg,#4c1d95,var(--purple));color:#fff;':''}">${l}</button>`).join("")}
  </div>`;
  const recipes=CRAFTING_RECIPES.filter(r=>r.prof===CRAFT_PROF);
  const disc=S.talents?.t_craft?1:0;
  recipes.forEach(recipe=>{
    const costEntries=Object.entries(recipe.cost);
    const canCraft=costEntries.every(([mat,need])=>(mats[mat]||0)>=Math.max(1,need-disc));
    h+=`<div class="card" style="border-color:${canCraft?"#4c1d95":"var(--border)"};opacity:${canCraft?1:.7}">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="font-size:26px">${recipe.icon}</div>
        <div style="flex:1">
          <div class="cinzel" style="font-size:11px;color:#c4b5fd;font-weight:700">${recipe.name}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:1px">${recipe.desc}</div>
          <div style="display:flex;gap:5px;margin-top:4px;flex-wrap:wrap">
            ${costEntries.map(([mat,need])=>{const actual=Math.max(1,need-disc);const has=mats[mat]||0;return`<span class="mat-chip" style="color:${has>=actual?MATERIALS[mat].color:"#ef4444"};background:${has>=actual?MATERIALS[mat].color+"22":"#ef444422"};border-color:${has>=actual?MATERIALS[mat].color+"44":"#ef444444"}">${MATERIALS[mat].icon} ${has}/${actual}</span>`;}).join("")}
            ${disc>0?'<span class="mat-chip" style="color:#a78bfa;background:#a78bfa22;border-color:#a78bfa44">🔨 -1</span>':""}
          </div>
        </div>
        <button onclick="craft('${recipe.id}')" ${!canCraft?"disabled":""} style="padding:8px 12px;border-radius:8px;border:none;background:${canCraft?"linear-gradient(90deg,#4c1d95,var(--purple))":"#1f2937"};color:${canCraft?"#fff":"#4b5563"};font-family:'Cinzel',serif;font-size:10px;font-weight:700;flex-shrink:0">${canCraft?"⚗️ Fertigen":"🔒"}</button>
      </div>
    </div>`;
  });
  return h;
}

function renderArchetypeCard(){
  const arch=getArchetype();
  return '<div class="section-title">DEIN ARCHETYP</div>'
    +'<div class="card" style="border-color:'+arch.color+'44;background:linear-gradient(135deg,#0d0b1e,'+arch.color+'11)">'
    +'<div style="display:flex;gap:12px;align-items:center">'
    +'<div style="font-size:36px">'+arch.icon+'</div>'
    +'<div style="flex:1">'
    +'<div class="cinzel" style="font-size:15px;color:'+arch.color+';font-weight:900">'+arch.name+'</div>'
    +'<div style="font-size:10px;color:#6b7280;margin-top:2px;font-style:italic">'+arch.desc+'</div>'
    +'<div style="margin-top:6px;font-size:10px;background:'+arch.color+'22;border:1px solid '+arch.color+'44;border-radius:7px;padding:4px 8px;color:'+arch.color+';display:inline-block">⚡ '+arch.bonusLabel+'</div>'
    +'</div></div>'
    +'<div style="margin-top:10px;font-size:10px;color:#4b5563;font-style:italic">'+(arch.manuallyChosen?"🎯 Manuell gewählt":"Automatisch aus deinen stärksten Attributen.")+'</div>'
    +'<button onclick="openArchetypePicker()" style="width:100%;margin-top:10px;padding:8px;border-radius:9px;border:1px solid '+arch.color+'44;background:'+arch.color+'11;color:'+arch.color+';font-family:\'Cinzel\',serif;font-size:11px;font-weight:600;cursor:pointer">⚡ Archetyp wählen / wechseln</button>'
    +'</div>';
}

function renderDailyEventCard(ev){
  return '<div class="section-title">HEUTIGES EREIGNIS</div>'
    +'<div class="card" style="border-color:'+ev.color+'44">'
    +'<div style="display:flex;gap:10px;align-items:center">'
    +'<div style="font-size:28px">'+ev.icon+'</div>'
    +'<div>'
    +'<div class="cinzel" style="font-size:12px;color:'+ev.color+';font-weight:700">'+ev.title+'</div>'
    +'<div style="font-size:10px;color:#6b7280;margin-top:2px">'+ev.desc+'</div>'
    +'</div></div></div>';
}

// TAB: PROFIL
// ── TAB: HEIMSTATT ──────────────────────────────────────────────
function renderHeimsatt(){
  const buildings=S.heimstatt?.buildings||{};
  const guild=S.guild||{};
  let h=`<div class="sub-tab-row">
    <button onclick="setHeimsattTab('gebaeude')" class="sub-tab-btn" style="${HEIMSTATT_SUBTAB==='gebaeude'?'background:linear-gradient(90deg,#92400e,var(--gold));color:#000;':''}">🏗️ Gebäude</button>
    <button onclick="setHeimsattTab('gilde')" class="sub-tab-btn" style="${HEIMSTATT_SUBTAB==='gilde'?'background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;':''}">⚜️ Gilde</button>
  </div>`;
  h+=HEIMSTATT_SUBTAB==="gebaeude"?renderGebaeude(buildings):renderGilde(guild);
  return h;
}
function renderGebaeude(buildings){
  const bb=Object.keys(buildings).length;
  let h=`<div class="card" style="padding:8px 12px;margin-bottom:10px;border-color:#92400e44">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="cinzel" style="font-size:11px;color:var(--gold)">🏰 DEINE HEIMSTATT</div>
      <div style="font-size:9px;color:#6b7280;margin-top:1px">${bb} von ${HEIMSTATT_BUILDINGS.length} Gebäude errichtet</div></div>
      <div style="font-size:20px">${bb>=8?"🌟":bb>=5?"🏰":bb>=3?"🏠":bb>=1?"🛖":"⛺"}</div>
    </div>
  </div>`;
  HEIMSTATT_BUILDINGS.forEach(bld=>{
    const owned=!!buildings[bld.id];
    const reqOk=hasBuildingReq(bld);
    const canBuy=!owned&&reqOk&&S.character.gold>=bld.cost;
    const reqBld=bld.req?HEIMSTATT_BUILDINGS.find(b=>b.id===bld.req):null;
    h+=`<div class="card" style="border-color:${owned?bld.color+"66":"var(--border)"};background:${owned?bld.color+"11":"var(--bg2)"};opacity:${reqOk||owned?1:.55}">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="font-size:28px;flex-shrink:0">${bld.icon}</div>
        <div style="flex:1">
          <div class="cinzel" style="font-size:12px;color:${owned?bld.color:"#e9d5ff"};font-weight:700">${bld.name}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:1px">${bld.desc}</div>
          ${reqBld&&!owned?`<div style="font-size:8px;color:#f59e0b;margin-top:2px">🔒 Benötigt: ${reqBld.icon} ${reqBld.name}</div>`:""}
          ${owned?`<div style="font-size:9px;color:#22c55e;margin-top:3px">✓ Aktiv & in Betrieb</div>`:""}
        </div>
        <div style="flex-shrink:0;text-align:right">
          ${owned
            ?`<div style="font-size:12px;color:#22c55e">✓</div>`
            :`<div style="font-size:11px;color:var(--gold);font-weight:700;margin-bottom:5px">🪙 ${bld.cost}</div>
              <button onclick="buyBuilding('${bld.id}')" ${!canBuy?"disabled":""} style="padding:5px 10px;border-radius:7px;border:none;font-size:9px;font-family:'Cinzel',serif;font-weight:700;background:${canBuy?`linear-gradient(90deg,#92400e,${bld.color})`:"#1f2937"};color:${canBuy?"#fff":"#4b5563"};cursor:${canBuy?"pointer":"default"}">${canBuy?"Bauen":"🔒"}</button>`
          }
        </div>
      </div>
    </div>`;
  });
  return h;
}
function renderGilde(guild){
  const weeklyTotal=Object.keys(guild).reduce((s,id)=>{const n=NPCS.find(x=>x.id===id);return s+(n?.weekly||0);},0);
  let h=`<div class="card" style="padding:8px 12px;margin-bottom:10px;border-color:#4f46e544">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div><div class="cinzel" style="font-size:11px;color:var(--purple2)">⚜️ ABENTEURERGILDE</div>
      <div style="font-size:9px;color:#6b7280;margin-top:1px">${Object.keys(guild).length} Gefährten · Unterhalt: 🪙${weeklyTotal}/Woche</div></div>
      <div style="font-size:9px;color:#4b5563">Gold: ${S.character.gold}</div>
    </div>
  </div>`;
  NPCS.forEach(n=>{
    const hired=!!guild[n.id];
    const canHire=!hired&&S.character.gold>=n.hire;
    h+=`<div class="card" style="border-color:${hired?n.color+"66":"var(--border)"};background:${hired?n.color+"11":"var(--bg2)"}">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="font-size:28px;flex-shrink:0">${n.icon}</div>
        <div style="flex:1">
          <div class="cinzel" style="font-size:12px;color:${hired?n.color:"#e9d5ff"};font-weight:700">${n.name}</div>
          <div style="font-size:9px;color:#6b7280;margin-top:1px">${n.desc}</div>
          <div style="font-size:9px;color:#f59e0b;margin-top:2px">Einstellung: 🪙${n.hire} · Unterhalt: 🪙${n.weekly}/Woche</div>
          ${hired?`<div style="font-size:9px;color:#22c55e;margin-top:2px">✓ Im Dienst</div>`:""}
        </div>
        <div style="flex-shrink:0">
          ${hired
            ?`<button onclick="fireNPC('${n.id}')" style="padding:5px 8px;border-radius:7px;border:1px solid #374151;background:transparent;color:#6b7280;font-size:9px;cursor:pointer">Entl.</button>`
            :`<button onclick="hireNPC('${n.id}')" ${!canHire?"disabled":""} style="padding:5px 10px;border-radius:7px;border:none;font-size:9px;font-family:'Cinzel',serif;font-weight:700;background:${canHire?`linear-gradient(90deg,#4f46e5,${n.color})`:"#1f2937"};color:${canHire?"#fff":"#4b5563"};cursor:${canHire?"pointer":"default"}">${canHire?"Anheuern":"🔒"}</button>`
          }
        </div>
      </div>
    </div>`;
  });
  return h;
}

// ── KOMPENDIUM (within Profil) ───────────────────────────────────
function renderKompendium(){
  const discovered=new Set(S.inventory.map(i=>i.id));
  S.zoo.forEach(p=>discovered.add(p.id));
  let h=`<div class="section-title">📖 KOMPENDIUM — ENTDECKUNGEN</div>`;

  // Items grid
  h+=`<div class="card" style="padding:10px 12px;margin-bottom:10px">
    <div style="font-size:9px;color:var(--gold);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">⚔️ AUSRÜSTUNG (${discovered.size} / ${ITEMS.length+Object.keys(CRAFTED_ITEMS).length})</div>
    <div class="komp-grid">
      ${ITEMS.map(item=>{
        const found=discovered.has(item.id);
        const r=RARITIES[item.rarity];
        return`<div class="komp-cell${found?"":" locked"}" title="${found?item.name:"???"}" style="${found?`border-color:${r.border};background:${r.glow}`:""}" onclick="${found?`alert('${item.name}: ${Object.entries(item.stats).map(([k,v])=>k+'+'+v).join(' · ')}')`:''}">${found?item.icon:"❓"}<div style="font-size:7px;color:${found?r.color:"#374151"};margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${found?item.name.substring(0,7):"???"}</div></div>`;
      }).join("")}
    </div>
  </div>`;

  // Pets grid
  h+=`<div class="card" style="padding:10px 12px;margin-bottom:10px">
    <div style="font-size:9px;color:var(--teal);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">🐾 HAUSTIERE (${S.zoo.length} / ${PETS.length})</div>
    <div class="komp-grid">
      ${PETS.map(pet=>{
        const found=S.zoo.some(p=>p.id===pet.id);
        const r=RARITIES[pet.rarity];
        return`<div class="komp-cell${found?"":" locked"}" style="${found?`border-color:${r.border};background:${r.glow}`:""}">${found?pet.evo[0]:"❓"}<div style="font-size:7px;color:${found?r.color:"#374151"};margin-top:2px">${found?pet.name.substring(0,6):"???"}</div></div>`;
      }).join("")}
    </div>
  </div>`;

  // Achievements
  const earned=ACHIEVEMENTS.filter(a=>{try{return a.check(S);}catch{return false;}});
  h+=`<div class="section-title">🏆 ERRUNGENSCHAFTEN (${earned.length}/${ACHIEVEMENTS.length})</div>
  <div class="card" style="padding:10px 12px">
    ${ACHIEVEMENTS.map(a=>{
      const got=earned.find(x=>x.id===a.id);
      return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)22;opacity:${got?1:.35}">
        <div style="font-size:18px">${a.icon}</div>
        <div style="flex:1"><div class="cinzel" style="font-size:10px;color:${got?"var(--gold)":"#374151"}">${a.name}</div>
        <div style="font-size:9px;color:#4b5563">${a.desc}</div></div>
        ${got?'<div style="font-size:12px;color:#22c55e">✓</div>':''}
      </div>`;
    }).join("")}
  </div>`;
  return h;
}

function renderProfil(){
  const ch=S.character;
  const attrs=computedAttrs();
  const hb=getHomeBase();
  const titles=getEarnedTitles();
  const pet=ch.equippedPet?PETS.find(p=>p.id===ch.equippedPet):null;
  const xpPct=Math.min((ch.xp/ch.xpToNext)*100,100);

  let h=`<div class="sub-tab-row">
    <button onclick="setProfilTab('profil')" class="sub-tab-btn" style="${PROFIL_SUBTAB==='profil'?'background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;':''}">👤 Profil</button>
    <button onclick="setProfilTab('kompendium')" class="sub-tab-btn" style="${PROFIL_SUBTAB==='kompendium'?'background:linear-gradient(90deg,#0f766e,#14b8a6);color:#fff;':''}">📖 Kompendium</button>
  </div>`;
  if(PROFIL_SUBTAB==="kompendium")return h+renderKompendium();
  h+=`
  <div class="card" style="text-align:center;background:linear-gradient(135deg,#13103a,#0d0b1e);border-color:#2d2a6e">
    <div style="font-size:52px;margin-bottom:6px">${hb.icon}</div>
    <div class="cinzel" style="font-size:20px;font-weight:900;color:#c4b5fd">${ch.name}</div>
    <div style="font-size:11px;color:var(--purple);margin-top:2px;font-style:italic">${getLevelTitle(ch.level)} · Level ${ch.level}</div>
    ${pet?`<div style="margin-top:4px;font-size:11px;color:#6b7280">Begleiter: ${pet.evo[Math.min(Math.floor(ch.level/10),2)]} ${pet.name}</div>`:""}
    <div style="margin:10px 0 4px">
      <div style="font-size:9px;color:var(--purple2);margin-bottom:2px">${ch.xp} / ${ch.xpToNext} XP</div>
      <div class="bar-wrap" style="height:8px"><div class="bar-fill" style="width:${xpPct}%;background:linear-gradient(90deg,var(--purple),#c084fc);box-shadow:0 0 8px #7c3aed88"></div></div>
    </div>
    <div style="display:flex;justify-content:center;gap:16px;margin-top:10px;font-size:12px">
      <div style="text-align:center"><div style="color:var(--gold);font-weight:700">🪙 ${ch.gold}</div><div style="font-size:9px;color:#6b7280">Gold</div></div>
      <div style="text-align:center"><div style="color:#f59e0b;font-weight:700">🔥 ${ch.streak}</div><div style="font-size:9px;color:#6b7280">Streak</div></div>
      <div style="text-align:center"><div style="color:var(--pink);font-weight:700">💫 ${S.nat20Count||0}</div><div style="font-size:9px;color:#6b7280">Nat 20s</div></div>
      <div style="text-align:center"><div style="color:#22c55e;font-weight:700">🏆 ${S.dungeons.filter(d=>d.bossKilled).length}</div><div style="font-size:9px;color:#6b7280">Bosse</div></div>
    </div>
  </div>

  <div class="section-title">ATTRIBUTE (mit Boni)</div>
  <div class="card">
    ${Object.entries(ATTRS).map(([k,a])=>{
      const base=S.baseAttrs[k];const total=attrs[k]||base;const bonus=total-base;
      const archMod=getArchetypeDiceMod(a.cat);
      const pct=Math.min(((total-8)/12)*100,100);
      return`<div style="margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px">
          <span style="color:${a.color}">${a.icon} ${a.label}</span>
          <span style="color:#e9d5ff">${total} ${bonus>0?`<span style="color:#22c55e;font-size:9px">+${bonus} Item</span>`:""} ${archMod>0?`<span style="color:#fbbf24;font-size:9px">⚡+${archMod} Archtyp</span>`:""}</span>
        </div>
        <div class="bar-wrap" style="height:5px"><div class="bar-fill" style="width:${pct}%;background:${a.color}"></div></div>
      </div>`;
    }).join("")}
  </div>

  ${renderArchetypeCard()}

  ${S.dailyEvent?renderDailyEventCard(S.dailyEvent):""}

  <div class="section-title">HOME BASE REISE</div>
  <div class="card">
    ${HOME_BASES.map((hb2,i)=>{
      const reached=ch.level>=hb2.lvl;
      const isCurrent=getHomeBase()===hb2;
      return`<div style="display:flex;gap:10px;align-items:center;padding:6px 0;border-bottom:1px solid ${i<HOME_BASES.length-1?"var(--border)":"transparent"}">
        <div style="font-size:20px;opacity:${reached?1:.3}">${hb2.icon}</div>
        <div style="flex:1">
          <div class="cinzel" style="font-size:11px;color:${isCurrent?"var(--gold)":reached?"#e9d5ff":"#374151"};font-weight:${isCurrent?700:400}">${hb2.name} ${isCurrent?"← Du bist hier":""}</div>
          <div style="font-size:9px;color:#4b5563">Ab Level ${hb2.lvl}</div>
        </div>
        <div style="font-size:14px">${reached?"✓":"🔒"}</div>
      </div>`;
    }).join("")}
  </div>

  <div class="section-title">ERRUNGENE TITEL (${titles.length}/${TITLES.length})</div>
  <div class="card">
    ${TITLES.map(t=>{
      const earned=titles.find(x=>x.id===t.id);
      return`<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)22;opacity:${earned?1:.35}">
        <div style="font-size:18px">${t.icon}</div>
        <div class="cinzel" style="font-size:11px;color:${earned?"var(--purple2)":"#374151"}">${t.name}</div>
        <div style="margin-left:auto;font-size:12px">${earned?"✓":""}</div>
      </div>`;
    }).join("")}
  </div>

  <div class="section-title">ABENTEUER-CHRONIK</div>
  <div class="card">
    ${S.log.length===0?`<div style="color:#374151;font-style:italic;text-align:center;padding:16px">Noch keine Taten...</div>`
      :S.log.slice(0,20).map(e=>`<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border)22;font-size:11px">
        <span style="color:#9ca3af;line-height:1.4">${e.text}</span>
        <span style="color:#374151;flex-shrink:0;margin-left:6px;font-size:9px">${e.time}</span>
      </div>`).join("")
    }
  </div>
  ${renderTalentTree()}
  ${renderPrestigeSection()}
  <div style="height:20px"></div>`;
  return h;
}

function renderTalentTree(){
  const pts=S.talentPoints||0;
  const branches={combat:"⚔️ Kampf",wealth:"🪙 Reichtum",crafting:"⚗️ Handwerk"};
  let h=`<div class="section-title">TALENTBAUM ${pts>0?`<span style="color:#fbbf24;margin-left:4px">(${pts} Punkte verfügbar)</span>`:""}</div>`;
  Object.entries(branches).forEach(([branch,label])=>{
    const talents=TALENT_TREE.filter(t=>t.branch===branch);
    h+=`<div class="card" style="padding:10px;margin-bottom:8px">
      <div style="font-size:10px;color:#6b7280;font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">${label}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px">
        ${talents.map(t=>{
          const owned=!!S.talents?.[t.id];
          const canBuy=!owned&&pts>=t.cost;
          return`<div onclick="${canBuy?`buyTalent('${t.id}')`:''}" style="background:${owned?t.color+"22":"#0d0b1e"};border:1px solid ${owned?t.color:canBuy?"#4b5563":"#1a1a2e"};border-radius:9px;padding:7px 5px;text-align:center;cursor:${canBuy?"pointer":"default"};opacity:${canBuy||owned?1:.5}">
            <div style="font-size:16px">${t.icon}</div>
            <div class="cinzel" style="font-size:8px;color:${owned?t.color:canBuy?"#e9d5ff":"#4b5563"};margin-top:2px;line-height:1.2">${t.name}</div>
            <div style="font-size:8px;color:#6b7280;margin-top:2px;line-height:1.2">${t.desc}</div>
            ${owned?'<div style="font-size:9px;color:#22c55e;margin-top:3px">✓ Aktiv</div>':canBuy?`<div style="font-size:9px;color:#fbbf24;margin-top:3px">🌟 Kaufen</div>`:""}
          </div>`;
        }).join("")}
      </div>
    </div>`;
  });
  return h;
}

function renderPrestigeSection(){
  const pc=S.prestige||0;
  const lvl=S.character.level;
  const canPrestige=lvl>=20&&pc<6;
  let h=`<div class="section-title">🔰 RUHM-SYSTEM (PRESTIGE)</div>
  <div class="card" style="border-color:${canPrestige?"#f9a8d466":"var(--border)"};background:${canPrestige?"linear-gradient(135deg,#1c0a2e,#0d0b1e)":"var(--bg2)"}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div class="cinzel" style="font-size:14px;color:#f9a8d4;font-weight:700">${PRESTIGE_ICONS[Math.min(pc,6)]} Prestige ${pc}</div>
      <div style="font-size:10px;color:#6b7280">Max: 6</div>
    </div>
    <div style="font-size:10px;color:#9ca3af;margin-bottom:8px;line-height:1.5">Reset auf Level 1 — aber du behältst: Zoo, Talente, 50% Gold, 30% Materialien & ein mächtiges Erbstück.</div>`;
  if(pc>0&&S.heirlooms?.length){
    h+=`<div style="font-size:9px;color:#fbbf24;font-family:'Cinzel',serif;margin-bottom:6px">DEINE ERBSTÜCKE:</div>`;
    S.heirlooms.forEach(it=>{
      const r=RARITIES[it.rarity];
      h+=`<div style="display:flex;gap:7px;align-items:center;padding:5px 0;border-bottom:1px solid var(--border)22">
        <span style="font-size:16px">${it.icon}</span>
        <span class="cinzel" style="font-size:10px;color:${r.color}">${it.name}</span>
        <span style="font-size:9px;color:#4b5563;margin-left:auto">${Object.entries(it.stats).map(([k,v])=>k+"+"+v).join(" ")}</span>
      </div>`;
    });
  }
  if(canPrestige){
    h+=`<button onclick="MODAL={type:'prestigeConfirm'};render()" style="width:100%;margin-top:10px;padding:10px;border-radius:10px;border:none;background:linear-gradient(90deg,#7c2d92,#f9a8d4);color:#000;font-family:'Cinzel',serif;font-size:12px;font-weight:900;cursor:pointer;animation:pulse .8s infinite">🔰 JETZT AUFSTEIGEN (Lv ${lvl})</button>`;
  } else if(!canPrestige&&lvl<20){
    h+=`<div style="text-align:center;font-size:10px;color:#4b5563;margin-top:6px">Level 20 erforderlich (aktuell: ${lvl})</div>`;
  }
  h+=`</div>`;
  return h;
}

// ADD (floating form, accessed via long press on +)
function renderAdd(){
  let h=`<div class="section-title">NEUE QUEST ERSTELLEN</div>
  <div class="card">
    <input class="input-field" id="new-q-title" placeholder="Quest-Titel..." oninput="">
    <select class="select-field" id="new-q-cat">
      ${Object.entries(CAT_LABEL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}
    </select>
    <select class="select-field" id="new-q-dungeon">
      <option value="">📋 Allgemeine Quests</option>
      ${S.dungeons.map(d=>`<option value="${d.id}">${d.icon} ${d.name}</option>`).join("")}
    </select>
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">
      <span style="font-size:11px;color:#9ca3af;flex-shrink:0">DC:</span>
      <input type="number" class="input-field" id="new-q-dc" value="10" min="4" max="20" style="margin-bottom:0;flex:1">
    </div>
    <button class="btn-primary" onclick="submitNewQuest()">⚔️ QUEST ANNEHMEN</button>
  </div>
  <div style="height:20px"></div>`;
  return h;
}

// ═══════════════════════════════════════════════════════════════
// MODAL RENDERERS
// ═══════════════════════════════════════════════════════════════

// Point Buy
function renderPointBuy(){
  if(!PB_ATTRS)PB_ATTRS={STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8};
  const rem=pbRemaining();
  const PB_COSTS={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
  return`<div style="min-height:100vh;background:linear-gradient(160deg,#0d0b1e,#1a0a2e);display:flex;flex-direction:column;align-items:center;padding:30px 20px;font-family:'Crimson Pro',serif">
    <div class="cinzel" style="font-size:22px;color:#c4b5fd;font-weight:900;margin-bottom:4px;text-align:center">⚔️ CHARAKTER ERSTELLEN</div>
    <div style="font-size:13px;color:#6b7280;margin-bottom:20px;text-align:center">Verteile deine <span style="color:${rem===0?"#22c55e":rem<5?"#f59e0b":"var(--purple2)"}; font-weight:700">${rem}</span> verbleibenden Punkte</div>
    <input id="pb-name" class="input-field" placeholder="Dein Heldenname..." style="max-width:340px">
    <div class="card" style="width:100%;max-width:340px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <span class="cinzel" style="font-size:10px;color:var(--purple);letter-spacing:2px">ATTRIBUTE</span>
        <span style="font-size:13px;color:${rem===0?"#22c55e":rem<5?"#f59e0b":"var(--purple2)"};font-weight:700">${rem} Punkte</span>
      </div>
      ${Object.entries(ATTRS).map(([k,a])=>`
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
          <div style="font-size:16px;width:24px;text-align:center">${a.icon}</div>
          <div style="flex:1">
            <div style="font-size:11px;color:${a.color};font-weight:600">${a.label}</div>
            <div style="font-size:9px;color:#4b5563">${a.desc}</div>
          </div>
          <button onclick="pbSpend('${k}',-1)" style="width:28px;height:28px;border-radius:6px;border:1px solid #2d2a6e;background:#0d0b1e;color:${PB_ATTRS[k]<=8?"#2d2a6e":"#c4b5fd"};font-size:16px;font-weight:700;cursor:pointer;line-height:1" ${PB_ATTRS[k]<=8?"disabled":""}>−</button>
          <div class="cinzel" style="width:24px;text-align:center;font-size:15px;color:#e9d5ff;font-weight:700">${PB_ATTRS[k]}</div>
          <button onclick="pbSpend('${k}',1)" style="width:28px;height:28px;border-radius:6px;border:1px solid #2d2a6e;background:#0d0b1e;color:var(--purple2);font-size:16px;font-weight:700;cursor:pointer;line-height:1" ${PB_ATTRS[k]>=15||rem<=0?"disabled":""}>+</button>
        </div>`).join("")}
    </div>
    <button onclick="finishSetup()" style="width:100%;max-width:340px;padding:13px;border-radius:12px;border:none;background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;font-family:'Cinzel',serif;font-size:14px;font-weight:900;letter-spacing:1px;box-shadow:0 0 20px #7c3aed44;cursor:pointer">
      ⚔️ ABENTEUER BEGINNEN
    </button>
  </div>`;
}

// Roll Result Modal
function renderRollModal(data){
  const {raw,total,mod,diceMod,loot,quest,item,pet,earnedXP,earnedGold,matDropped}=data;
  const isNat20=raw===20;const isNat1=raw===1;
  const storyLine=loot.story[Math.floor(Math.random()*loot.story.length)];
  return`<div class="overlay" onclick="closeModal()">
    <div class="modal" onclick="event.stopPropagation()" style="text-align:center;border-color:${loot.color};box-shadow:0 0 50px ${loot.color}44">
      <div style="font-size:64px;margin-bottom:6px;filter:drop-shadow(0 0 16px ${loot.color})">${isNat20?"💫":isNat1?"💀":"⚄"}</div>
      <div class="cinzel" style="font-size:52px;font-weight:900;color:${loot.color};text-shadow:0 0 30px ${loot.color};line-height:1">${raw}</div>
      ${(mod+diceMod)!==0?`<div style="font-size:11px;color:#6b7280;margin-top:2px">+${mod+diceMod} Bonus → ${total} gesamt</div>`:""}
      <div class="cinzel" style="font-size:16px;color:${loot.color};font-weight:700;margin:10px 0 4px;letter-spacing:1px">${loot.icon} ${loot.label}</div>
      <div style="font-size:12px;color:#9ca3af;font-style:italic;margin-bottom:10px">"${storyLine}"</div>
      <div class="card" style="background:#0d0b1e;border-color:#1e1b4b;margin-bottom:12px">
        ${loot.tier==="fail"
          ?`<div style="color:var(--red);font-size:12px">Kein XP · Kein Gold · Morgen neuer Versuch</div>`
          :`<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;font-size:12px">
            <span style="color:var(--purple2)">+${earnedXP} XP</span>
            <span style="color:var(--gold)">+${earnedGold} 🪙</span>
            ${item?`<span style="color:${RARITIES[item.rarity].color}">${item.icon} ${item.name}!</span>`:""}
            ${pet?`<span style="color:${RARITIES[pet.rarity].color}">${pet.icon} ${pet.name}!</span>`:""}
            ${matDropped?`<span style="color:${MATERIALS[matDropped.key].color}">${MATERIALS[matDropped.key].icon}×${matDropped.amt} ${MATERIALS[matDropped.key].name}!</span>`:""}
          </div>`}
      </div>
      <button onclick="closeModal()" style="padding:10px 28px;border-radius:10px;border:none;background:linear-gradient(90deg,${loot.color}88,${loot.color});color:${isNat20?"#000":"#fff"};font-family:'Cinzel',serif;font-size:13px;font-weight:700;cursor:pointer">
        Weiter →
      </button>
    </div>
  </div>`;
}

// Level Up Modal
function renderLvlUp(){
  const hb=getHomeBase();
  return`<div class="overlay" onclick="closeModal()">
    <div class="modal" style="text-align:center;border-color:var(--purple);box-shadow:0 0 80px #7c3aed66;animation:levelUp .4s ease-out">
      <div style="font-size:52px;margin-bottom:8px">⚔️</div>
      <div class="cinzel" style="font-size:30px;color:var(--gold);font-weight:900;text-shadow:0 0 24px var(--gold)">LEVEL UP!</div>
      <div style="font-size:18px;color:var(--purple2);margin-top:6px">Level ${S.character.level}</div>
      <div class="cinzel" style="font-size:14px;color:#c4b5fd;margin-top:2px">${getLevelTitle(S.character.level)}</div>
      ${getHomeBase().lvl===S.character.level?`<div style="margin-top:12px;padding:10px;background:#0d0b1e;border-radius:10px;border:1px solid var(--gold)">
        <div style="font-size:20px">${hb.icon}</div>
        <div class="cinzel" style="font-size:12px;color:var(--gold);margin-top:4px">HOME BASE UPGRADE!</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">${hb.name}</div>
      </div>`:""}
      <div style="font-size:11px;color:#4b5563;margin-top:14px">Tippen zum Schließen</div>
    </div>
  </div>`;
}

// Daily Event Modal
function renderDailyEventModal(ev){
  return`<div class="overlay" onclick="closeModal()">
    <div class="modal" onclick="event.stopPropagation()" style="text-align:center;border-color:${ev.color};box-shadow:0 0 40px ${ev.color}44">
      <div style="font-size:52px;margin-bottom:6px">${ev.icon}</div>
      <div style="font-size:9px;color:${ev.color};letter-spacing:3px;font-family:'Cinzel',serif;margin-bottom:4px">TAGES-EREIGNIS</div>
      <div class="cinzel" style="font-size:18px;color:${ev.color};font-weight:900;margin-bottom:6px">${ev.title}</div>
      <div style="font-size:12px;color:#9ca3af;font-style:italic;margin-bottom:12px">"${ev.story}"</div>
      <div style="background:#0d0b1e;border:1px solid ${ev.color}44;border-radius:10px;padding:10px 12px;margin-bottom:16px;font-size:12px;color:#e9d5ff">${ev.desc}</div>
      <button onclick="closeModal()" style="padding:10px 28px;border-radius:10px;border:none;background:linear-gradient(90deg,${ev.color}88,${ev.color});color:${ev.color==='#fbbf24'?'#000':'#fff'};font-family:'Cinzel',serif;font-size:13px;font-weight:700;cursor:pointer">Tag beginnen →</button>
    </div>
  </div>`;
}

// Tutorial
function renderTutorial(){
  const page=MODAL.data?.page||0;
  const p=TUTORIAL_PAGES[page];
  return`<div class="overlay" onclick="closeModal()">
    <div class="modal" onclick="event.stopPropagation()">
      <div style="text-align:center;margin-bottom:14px">
        <div style="font-size:32px">${p.icon}</div>
        <div class="cinzel" style="font-size:15px;color:#c4b5fd;font-weight:700;margin-top:4px">${p.title}</div>
        <div style="font-size:10px;color:#4b5563;margin-top:2px">${page+1} / ${TUTORIAL_PAGES.length}</div>
      </div>
      ${p.lines.map(l=>`<div class="card" style="padding:9px 12px;margin-bottom:7px;font-size:12px;color:#9ca3af;line-height:1.5;background:#0d0b1e">
        <span style="color:var(--purple);margin-right:6px">▸</span>${l}
      </div>`).join("")}
      <div style="display:flex;gap:8px;margin-top:14px">
        ${page>0?`<button onclick="tutPage(${page-1})" style="flex:1;padding:8px;border-radius:8px;border:none;background:#2d2a6e;color:#c4b5fd;cursor:pointer;font-size:12px">← Zurück</button>`:"<div style='flex:1'></div>"}
        ${page<TUTORIAL_PAGES.length-1
          ?`<button onclick="tutPage(${page+1})" style="flex:1;padding:8px;border-radius:8px;border:none;background:var(--blue);color:#fff;cursor:pointer;font-size:12px;font-weight:600">Weiter →</button>`
          :`<button onclick="closeModal()" style="flex:1;padding:8px;border-radius:8px;border:none;background:var(--green);color:#fff;cursor:pointer;font-size:12px;font-weight:600">Fertig ✓</button>`}
      </div>
    </div>
  </div>`;
}

// Boss Fight
function renderBossScreen(){
  if(!BOSS_STATE)return"";
  const dng=S.dungeons.find(d=>d.id===BOSS_STATE.dungeonId);
  const boss=dng.boss;
  const bHpPct=Math.min((BOSS_STATE.bossHp/boss.maxHp)*100,100);
  const pHpPct=Math.min((BOSS_STATE.playerHp/S.character.maxHp)*100,100);
  const bCol=bHpPct>50?"#ef4444":bHpPct>25?"#f59e0b":"#6b7280";
  const pCol=pHpPct>60?"#22c55e":pHpPct>30?"#f59e0b":"#ef4444";

  const bossSection=document.getElementById("boss-screen");
  if(!bossSection)return;

  bossSection.innerHTML=`
    <div style="background:linear-gradient(180deg,#1a0a2e,#08060f);border-bottom:1px solid #3b0764;padding:12px 18px;text-align:center;position:sticky;top:0;z-index:10">
      <div style="font-size:9px;color:var(--purple);letter-spacing:3px;font-family:'Cinzel',serif">⚔️ MINIBOSS · ${dng.name.toUpperCase()}</div>
      <div class="cinzel" style="font-size:17px;color:var(--pink);font-weight:900;margin-top:2px">${boss.icon} ${boss.name}</div>
    </div>
    <div style="padding:14px 18px">
      <div class="card" style="background:#110820;border-color:#3b0764;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#c084fc;margin-bottom:4px">
          <span class="cinzel">${boss.icon} Boss HP</span><span style="color:${bCol};font-weight:700">${BOSS_STATE.bossHp}/${boss.maxHp}</span>
        </div>
        <div class="bar-wrap" style="height:10px"><div class="bar-fill" style="width:${bHpPct}%;background:linear-gradient(90deg,#dc2626,#f87171);box-shadow:0 0 8px #ef444466"></div></div>
        <div style="font-size:42px;text-align:center;margin-top:8px;opacity:${.3+bHpPct/140}">${boss.icon}</div>
      </div>
      <div class="card" style="background:#0a1220;border-color:#1e3a5f;margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:#93c5fd;margin-bottom:4px">
          <span class="cinzel">⚔️ Du · DC ${boss.dc}</span><span style="color:${pCol};font-weight:700">${BOSS_STATE.playerHp}/${S.character.maxHp} HP</span>
        </div>
        <div class="bar-wrap" style="height:8px"><div class="bar-fill" style="width:${pHpPct}%;background:${pCol};box-shadow:0 0 6px ${pCol}88"></div></div>
      </div>
      <div class="card" style="background:#0a0613;min-height:70px;margin-bottom:12px;padding:10px">
        <div class="section-title">KAMPF-LOG</div>
        ${BOSS_STATE.log.length===0?`<div style="color:#2d2a4e;font-size:11px;font-style:italic;text-align:center;padding-top:8px">Der Boss wartet...</div>`
          :BOSS_STATE.log.slice(0,5).map((l,i)=>`<div style="font-size:11px;color:${l.startsWith("⚡")||l.startsWith("⚔️")?"#22c55e":"#f87171"};margin-bottom:2px;opacity:${1-i*.15}">${l}</div>`).join("")}
      </div>
      <div id="boss-actions">
        ${renderBossActionsHTML()}
      </div>
    </div>`;
}

function renderBossActionsHTML(){
  if(!BOSS_STATE)return"";
  const boss=S.dungeons.find(d=>d.id===BOSS_STATE.dungeonId)?.boss;
  if(BOSS_STATE.phase==="victory"){
    return`<div style="text-align:center;padding:20px 14px;background:linear-gradient(135deg,#052e16,#064e3b);border:2px solid #22c55e;border-radius:14px">
      <div style="font-size:36px;margin-bottom:6px">🏆</div>
      <div class="cinzel" style="font-size:20px;color:#4ade80;font-weight:900">BOSS BESIEGT!</div>
      <div style="color:#86efac;font-size:12px;margin:6px 0 14px">+${boss.reward.xp} XP · +${boss.reward.gold} 🪙</div>
      <button onclick="bossVictory()" style="padding:10px 24px;border-radius:10px;border:none;background:linear-gradient(90deg,#16a34a,#22c55e);color:#fff;font-family:'Cinzel',serif;font-size:12px;font-weight:700;cursor:pointer">Beute → </button>
    </div>`;
  }
  if(BOSS_STATE.phase==="defeat"){
    return`<div style="text-align:center;padding:20px 14px;background:linear-gradient(135deg,#1a0404,#3b0706);border:2px solid #ef4444;border-radius:14px">
      <div style="font-size:36px;margin-bottom:6px">💀</div>
      <div class="cinzel" style="font-size:20px;color:#f87171;font-weight:900">NIEDERLAGE</div>
      <div style="color:#fca5a5;font-size:12px;margin:6px 0 14px">Streak ${S.buffs?.streakshield?"geschützt":"verloren"}.</div>
      <button onclick="bossDefeat()" style="padding:10px 24px;border-radius:10px;border:none;background:linear-gradient(90deg,#7f1d1d,#dc2626);color:#fff;font-family:'Cinzel',serif;font-size:12px;font-weight:700;cursor:pointer">Schande...</button>
    </div>`;
  }
  if(BOSS_STATE.phase==="bossAttack"){
    return`<div style="text-align:center;padding:18px;background:#1a0a0a;border:1px solid #7f1d1d;border-radius:12px">
      <div style="font-size:28px">${boss.icon}</div>
      <div style="color:#f87171;font-family:'Cinzel',serif;font-size:12px;margin-top:6px">Boss greift an...</div>
    </div>`;
  }
  // idle
  const lr=BOSS_STATE.lastRoll;
  return`<div class="card" style="text-align:center">
    <div id="boss-die" class="die" onclick="bossDieRoll()" style="background:linear-gradient(135deg,#1e1b4b,#312e81);border-color:#4f46e5;color:#c4b5fd;box-shadow:0 0 14px #4f46e544;margin-bottom:8px;cursor:pointer">${lr?lr.raw:"⚄"}</div>
    <div style="font-size:10px;color:#4b5563;margin-bottom:10px">Tippen zum Würfeln · DC ${boss.dc}</div>
    ${lr?`<button onclick="bossAttack()" style="width:100%;padding:11px;border-radius:10px;border:none;background:${lr.isCrit?"linear-gradient(90deg,#92400e,var(--gold))":lr.success?"linear-gradient(90deg,#15803d,#22c55e)":"linear-gradient(90deg,#7f1d1d,#dc2626)"};color:${lr.isCrit?"#000":"#fff"};font-family:'Cinzel',serif;font-size:12px;font-weight:900;cursor:pointer">
      ${lr.isCrit?"⚡ KRITISCHER ANGRIFF!":lr.success?"⚔️ ANGREIFEN!":"💀 Riskieren"}
    </button>`:""}
  </div>`;
}

function renderBossActions(){
  const el=document.getElementById("boss-actions");
  if(el)el.innerHTML=renderBossActionsHTML();
}

// ADD SHEET (bottom sheet)
let ADD_SHEET_OPEN=false;
let ADD_SHEET_TAB="quest";
let EDIT_DUNGEON_ID=null;
let EDIT_QUEST_ID=null;  // {id, dungeonId} when editing existing quest

function renderAddSheet(){
  if(!ADD_SHEET_OPEN)return"";
  const isDng=ADD_SHEET_TAB==="dungeon";
  const editQ=EDIT_QUEST_ID?findQuest(EDIT_QUEST_ID.id,EDIT_QUEST_ID.dungeonId):null;
  return`<div class="sheet-overlay" onclick="closeAddSheet()">
    <div class="sheet" onclick="event.stopPropagation()" style="max-height:88vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="cinzel" style="font-size:13px;color:var(--accent3);letter-spacing:1px">${editQ?"✏️ QUEST BEARBEITEN":isDng?"🏰 DUNGEON":"⚔️ NEUE QUEST"}</div>
        <button onclick="closeAddSheet()" style="background:none;border:none;color:#6b7280;font-size:20px;padding:0 4px">✕</button>
      </div>
      ${!editQ?`<div class="sub-tab-row" style="margin-bottom:14px">
        <button onclick="setAddTab('quest')" class="sub-tab-btn" style="${!isDng?'background:linear-gradient(90deg,var(--accent1),var(--accent2));color:#fff;':''}">⚔️ Quest</button>
        <button onclick="setAddTab('dungeon')" class="sub-tab-btn" style="${isDng?'background:linear-gradient(90deg,#92400e,var(--gold));color:#000;':''}">🏰 Dungeon</button>
      </div>`:""}
      ${isDng&&!editQ?renderAddDungeonForm():renderAddQuestForm(editQ||null)}
    </div>
  </div>`;
}

function findQuest(id,dungeonId){
  if(dungeonId){const d=S.dungeons.find(x=>x.id===dungeonId);return d?.quests.find(q=>q.id==id)||null;}
  return S.quests.find(q=>q.id==id)||null;
}

function openEditQuest(id,dungeonId){
  EDIT_QUEST_ID={id,dungeonId:dungeonId||null};
  ADD_SHEET_TAB="quest";
  ADD_SHEET_OPEN=true;
  render();
}

function renderAddSheet(){
  if(!ADD_SHEET_OPEN)return"";
  const isDng=ADD_SHEET_TAB==="dungeon";
  return`<div class="sheet-overlay" onclick="closeAddSheet()">
    <div class="sheet" onclick="event.stopPropagation()" style="max-height:88vh;overflow-y:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div class="cinzel" style="font-size:13px;color:var(--purple2);letter-spacing:1px">${isDng?"🏰 DUNGEON VERWALTEN":"⚔️ NEUE QUEST"}</div>
        <button onclick="closeAddSheet()" style="background:none;border:none;color:#6b7280;font-size:20px;padding:0 4px">✕</button>
      </div>
      <div class="sub-tab-row" style="margin-bottom:14px">
        <button onclick="setAddTab('quest')" class="sub-tab-btn" style="${!isDng?'background:linear-gradient(90deg,#4f46e5,var(--purple));color:#fff;':''}">⚔️ Quest</button>
        <button onclick="setAddTab('dungeon')" class="sub-tab-btn" style="${isDng?'background:linear-gradient(90deg,#92400e,var(--gold));color:#000;':''}">🏰 Dungeon</button>
      </div>
      ${isDng?renderAddDungeonForm():renderAddQuestForm()}
    </div>
  </div>`;
}

function renderAddQuestForm(editQ){
  const inDng=QUEST_SUBTAB==="dungeons";
  const r=editQ?.repeat||{type:"daily",days:[],interval:1};
  const n=editQ?.notif||{enabled:false,time:"09:00"};
  // seed hidden input immediately (read by collectRepeatFromDOM without re-render)
  setTimeout(()=>{
    let h=document.getElementById("_repeat-type");
    if(!h){h=document.createElement("input");h.type="hidden";h.id="_repeat-type";document.body.appendChild(h);}
    h.value=r.type;
    // seed day buttons' dataset.on from repeat.days
    DAYS_DE.forEach((_,i)=>{
      const b=document.getElementById(`rday-${i}`);
      if(b)b.dataset.on=(r.days||[]).includes(i)?"1":"0";
    });
    // seed notif toggle
    const nb=document.getElementById("notif-toggle");
    if(nb)nb.dataset.on=n.enabled?"1":"0";
  },0);
  const dow=new Date().getDay();
  return`
    <input class="input-field" id="add-title" placeholder="Quest-Titel..." value="${editQ?.title||""}" style="outline:none">
    <select class="select-field" id="add-cat" style="outline:none">
      ${Object.entries(CAT_LABEL).map(([k,v])=>`<option value="${k}" ${editQ?.cat===k?"selected":""}>${v}</option>`).join("")}
    </select>
    ${inDng&&!editQ?`<select class="select-field" id="add-dungeon" style="outline:none">
      <option value="">📋 Allgemeine Quests</option>
      ${S.dungeons.map(d=>`<option value="${d.id}">${d.icon} ${d.name}</option>`).join("")}
    </select>`:`<input type="hidden" id="add-dungeon" value="${editQ?._dungeonId||""}">`}
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
      <span style="font-size:var(--fs-xs);color:#9ca3af;flex-shrink:0">DC:</span>
      <input type="number" class="input-field" id="add-dc" value="${editQ?.dc||10}" min="4" max="20" style="margin-bottom:0;flex:1;outline:none">
    </div>

    <div style="font-size:var(--fs-xs);color:var(--accent3);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">🔁 WIEDERHOLUNG</div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin-bottom:10px" id="repeat-type-btns">
      ${[["daily","täglich"],["weekdays","Wochentage"],["interval","Alle X Tage"],["manual","manuell"]].map(([v,l])=>
        `<button type="button" onclick="setRepeatType('${v}')" id="rtype-${v}" style="padding:7px 3px;border-radius:8px;border:1px solid ${r.type===v?"var(--accent3)":"var(--border)"};background:${r.type===v?"var(--accent-bg)":"var(--bg2)"};color:${r.type===v?"var(--accent3)":"#6b7280"};font-size:9px;font-family:'Cinzel',serif;cursor:pointer">${l}</button>`
      ).join("")}
    </div>

    <div id="repeat-weekdays" style="display:${r.type==="weekdays"?"flex":"none"};gap:4px;margin-bottom:10px;flex-wrap:wrap">
      ${DAYS_DE.map((d,i)=>`<button type="button" onclick="toggleRepeatDay(${i})" id="rday-${i}" style="padding:5px 8px;border-radius:7px;border:1px solid ${(r.days||[]).includes(i)?"var(--accent3)":"var(--border)"};background:${(r.days||[]).includes(i)?"var(--accent-bg)":"var(--bg2)"};color:${(r.days||[]).includes(i)?"var(--accent3)":"#6b7280"};font-size:11px;font-family:'Cinzel',serif;cursor:pointer">${d}</button>`).join("")}
    </div>

    <div id="repeat-interval" style="display:${r.type==="interval"?"flex":"none"};align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-size:var(--fs-xs);color:#9ca3af">Alle</span>
      <input type="number" id="repeat-interval-val" value="${r.interval||2}" min="2" max="30" style="width:60px;padding:7px;border-radius:7px;background:#080614;border:1px solid var(--accent-border);color:#e9d5ff;font-size:13px;outline:none">
      <span style="font-size:var(--fs-xs);color:#9ca3af">Tage</span>
    </div>

    <div style="font-size:var(--fs-xs);color:var(--accent3);font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:8px">🔔 BENACHRICHTIGUNG</div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <span style="font-size:var(--fs-xs);color:#9ca3af">Erinnerung aktivieren</span>
      <button type="button" onclick="toggleNotif()" id="notif-toggle" style="padding:6px 14px;border-radius:7px;border:1px solid ${n.enabled?"#14b8a6":"var(--border)"};background:${n.enabled?"#0a1a1a":"var(--bg2)"};color:${n.enabled?"#14b8a6":"#6b7280"};font-size:var(--fs-xs);cursor:pointer">${n.enabled?"🔔 An":"🔕 Aus"}</button>
    </div>
    <div id="notif-time-wrap" style="display:${n.enabled?"flex":"none"};align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-size:var(--fs-xs);color:#9ca3af;flex-shrink:0">Uhrzeit:</span>
      <input type="time" id="notif-time" value="${n.time||"09:00"}" style="flex:1;padding:8px;border-radius:7px;background:#080614;border:1px solid var(--accent-border);color:#e9d5ff;font-size:13px;outline:none">
    </div>

    <button onclick="${editQ?'submitEditQuest('+editQ.id+',\''+( editQ._dungeonId||'')+'\')':'submitAddSheet()'}" class="btn-primary">${editQ?"✏️ Speichern":"⚔️ Quest annehmen"}</button>`;
}

function renderAddDungeonForm(){
  const ed=EDIT_DUNGEON_ID?S.dungeons.find(d=>d.id===EDIT_DUNGEON_ID):null;
  const icons=["🏰","🌑","🗡️","🕯️","☠️","🌋","💀","🐉","⚔️","🧿","🌊","🔥","🏯","⛩️","🪦"];
  return`
    ${S.dungeons.length?`<div style="margin-bottom:12px">
      <div style="font-size:9px;color:#6b7280;font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:6px">DUNGEON BEARBEITEN:</div>
      <div style="display:flex;gap:5px;flex-wrap:wrap">
        <button onclick="setEditDungeon(null)" style="padding:4px 9px;border-radius:7px;border:1px solid ${!EDIT_DUNGEON_ID?"var(--purple)":"var(--border)"};background:${!EDIT_DUNGEON_ID?"#1e1b4b":"var(--bg2)"};color:${!EDIT_DUNGEON_ID?"var(--purple2)":"#6b7280"};font-size:10px;cursor:pointer">＋ Neu</button>
        ${S.dungeons.map(d=>`<button onclick="setEditDungeon('${d.id}')" style="padding:4px 9px;border-radius:7px;border:1px solid ${EDIT_DUNGEON_ID===d.id?"var(--gold)":"var(--border)"};background:${EDIT_DUNGEON_ID===d.id?"#1c1500":"var(--bg2)"};color:${EDIT_DUNGEON_ID===d.id?"var(--gold)":"#9ca3af"};font-size:10px;cursor:pointer">${d.icon} ${d.name.substring(0,10)}</button>`).join("")}
      </div>
    </div>`:""}
    <div style="font-size:9px;color:#6b7280;font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:6px">${ed?"BEARBEITEN: "+ed.name:"NEUER DUNGEON"}</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:8px">
      ${icons.map(ic=>`<button onclick="document.getElementById('dng-icon').value='${ic}';this.style.borderColor='var(--gold)'" style="font-size:16px;padding:3px 6px;border-radius:6px;border:1px solid var(--border);background:var(--bg2);cursor:pointer">${ic}</button>`).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-bottom:0">
      <input class="input-field" id="dng-icon" value="${ed?.icon||"🏰"}" style="outline:none;width:56px;text-align:center;font-size:18px">
      <input class="input-field" id="dng-name" value="${ed?.name||""}" placeholder="Dungeon-Name..." style="outline:none;flex:1">
    </div>
    <input class="input-field" id="dng-story" value="${ed?.story||""}" placeholder="Beschreibung / Geschichte..." style="outline:none">
    <div style="font-size:9px;color:#f59e0b;font-family:'Cinzel',serif;letter-spacing:1px;margin-bottom:6px;margin-top:4px">⚔️ BOSS</div>
    <input class="input-field" id="dng-boss-name" value="${ed?.boss?.name||""}" placeholder="Boss-Name..." style="outline:none">
    <div style="display:flex;gap:6px;margin-bottom:14px">
      <div style="flex:1"><div style="font-size:9px;color:#6b7280;margin-bottom:3px">Max HP</div>
        <input type="number" class="input-field" id="dng-boss-hp" value="${ed?.boss?.maxHp||100}" min="20" max="500" style="outline:none;margin-bottom:0;width:100%"></div>
      <div style="width:60px"><div style="font-size:9px;color:#6b7280;margin-bottom:3px">DC</div>
        <input type="number" class="input-field" id="dng-boss-dc" value="${ed?.boss?.dc||12}" min="4" max="20" style="outline:none;margin-bottom:0;width:100%"></div>
      <div style="width:60px"><div style="font-size:9px;color:#6b7280;margin-bottom:3px">Atk</div>
        <input type="number" class="input-field" id="dng-boss-atk" value="${ed?.boss?.atk||20}" min="5" max="100" style="outline:none;margin-bottom:0;width:100%"></div>
    </div>
    <div style="display:flex;gap:8px">
      <button onclick="${ed?`submitEditDungeon('${ed.id}')`:"submitNewDungeon()"}" class="${ed?"btn-teal":"btn-primary"}" style="flex:1">${ed?"✏️ Speichern":"🏰 Anlegen"}</button>
      ${ed?`<button onclick="deleteDungeon('${ed.id}')" style="padding:9px 14px;border-radius:10px;border:none;background:#1a0505;color:#ef4444;font-size:16px;cursor:pointer">🗑️</button>`:""}
    </div>`;
}