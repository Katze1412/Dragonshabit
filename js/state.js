'use strict';
function loadState(){try{const s=localStorage.getItem("rpg-v5");return s?JSON.parse(s):null;}catch{return null;}}
function saveState(){try{localStorage.setItem("rpg-v5",JSON.stringify(S));}catch{}}

// ═══════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════
const THEMES={
  purple:{name:"Arkane Nacht",   icon:"🟣",
    bg:"#08060f",bg2:"#0f0c26",bg3:"#13103a",border:"#1e1b4b",
    a1:"#4f46e5",a2:"#7c3aed",a3:"#a78bfa",glow:"#7c3aed44",ab:"#2d2a6e",abg:"#1e1b4b",
    text:"#e9d5ff",sub:"#c4b5fd"},
  crimson:{name:"Blut & Stahl",  icon:"🔴",
    bg:"#0f0608",bg2:"#1a0a0e",bg3:"#220d12",border:"#4a1020",
    a1:"#b91c1c",a2:"#dc2626",a3:"#f87171",glow:"#dc262644",ab:"#7f1d1d",abg:"#2a0a10",
    text:"#ffe4e6",sub:"#fca5a5"},
  ocean:{name:"Tiefsee",         icon:"🔵",
    bg:"#030d1a",bg2:"#061525",bg3:"#082035",border:"#0c3a5a",
    a1:"#0369a1",a2:"#0284c7",a3:"#38bdf8",glow:"#0284c744",ab:"#0c4a6e",abg:"#062030",
    text:"#e0f2fe",sub:"#7dd3fc"},
  forest:{name:"Waldgeist",      icon:"🟢",
    bg:"#030f06",bg2:"#071a0b",bg3:"#0a2410",border:"#14532d",
    a1:"#15803d",a2:"#16a34a",a3:"#4ade80",glow:"#16a34a44",ab:"#166534",abg:"#052e16",
    text:"#dcfce7",sub:"#86efac"},
  gold:{name:"Wüstenkaiser",     icon:"🟡",
    bg:"#0f0a02",bg2:"#1a1204",bg3:"#241a06",border:"#4a3500",
    a1:"#b45309",a2:"#d97706",a3:"#fbbf24",glow:"#d9770644",ab:"#78350f",abg:"#1c1000",
    text:"#fef9c3",sub:"#fde68a"},
  rose:{name:"Mondblüte",        icon:"🩷",
    bg:"#0f0610",bg2:"#1a0a1e",bg3:"#220d28",border:"#4a1060",
    a1:"#a21caf",a2:"#c026d3",a3:"#f0abfc",glow:"#c026d344",ab:"#701a75",abg:"#280a30",
    text:"#fdf4ff",sub:"#e879f9"},
  obsidian:{name:"Obsidian",     icon:"⚫",
    bg:"#050505",bg2:"#0d0d0d",bg3:"#141414",border:"#222222",
    a1:"#404040",a2:"#525252",a3:"#a3a3a3",glow:"#52525244",ab:"#292929",abg:"#111111",
    text:"#f5f5f5",sub:"#d4d4d4"},
  ember:{name:"Glutkern",        icon:"🔶",
    bg:"#0f0700",bg2:"#1c1000",bg3:"#261600",border:"#4a2500",
    a1:"#c2410c",a2:"#ea580c",a3:"#fb923c",glow:"#ea580c44",ab:"#9a3412",abg:"#1c0a00",
    text:"#fff7ed",sub:"#fdba74"},
};

function applyTheme(themeKey, sizeKey){
  const t=THEMES[themeKey]||THEMES.purple;
  const sz=sizeKey||"normal";
  const root=document.documentElement;
  root.style.setProperty("--bg",t.bg);
  root.style.setProperty("--bg2",t.bg2);
  root.style.setProperty("--bg3",t.bg3);
  root.style.setProperty("--border",t.border);
  root.style.setProperty("--purple",t.a2);
  root.style.setProperty("--purple2",t.a3);
  root.style.setProperty("--accent1",t.a1);
  root.style.setProperty("--accent2",t.a2);
  root.style.setProperty("--accent3",t.a3);
  root.style.setProperty("--accent-glow",t.glow);
  root.style.setProperty("--accent-border",t.ab);
  root.style.setProperty("--accent-bg",t.abg);
  // Dynamic glow style for XP bar and other accent uses
  document.getElementById("theme-style").textContent=`
    .bar-fill.xp-bar{background:linear-gradient(90deg,${t.a1},${t.a3});box-shadow:0 0 6px ${t.glow};}
    #header{background:linear-gradient(180deg,${t.bg3},${t.bg})!important;}
    #nav{background:${t.bg}ee!important;}
    .quest-card{background:${t.bg3}!important;}
    body{background:${t.bg}!important;}
  `;
  document.body.classList.toggle("sz-large", sz==="large");
  if(!S.settings)S.settings={};
  S.settings.theme=themeKey;
  S.settings.size=sz;
  saveState();
}

function initTheme(){
  const th=S?.settings?.theme||"purple";
  const sz=S?.settings?.size||"normal";
  applyTheme(th,sz);
}

// ═══════════════════════════════════════════════════════════════
// GAME LOGIC
// ═══════════════════════════════════════════════════════════════
function d20(){return Math.floor(Math.random()*20)+1;}
function attrMod(v){return Math.floor((v-10)/2);}

function computedAttrs(){
  const b={...S.baseAttrs};
  Object.values(S.character.equipment).forEach(item=>{
    if(!item)return;
    Object.entries(item.stats).forEach(([k,v])=>{b[k]=(b[k]||0)+v;});
  });
  if(S.character.equippedPet){
    const onExp=S.expeditions?.[S.character.equippedPet];
    if(!onExp){
      const p=PETS.find(x=>x.id===S.character.equippedPet);
      if(p)Object.entries(p.effect).forEach(([k,v])=>{b[k]=(b[k]||0)+v;});
    }
  }
  return b;
}

function getLoot(roll){
  if(roll===1)return LOOT[1];
  if(roll===20)return LOOT[20];
  if(roll<=9)return LOOT["2-9"];
  if(roll<=14)return LOOT["10-14"];
  return LOOT["15-19"];
}

function weightedRarity(tier){
  const w=R_WEIGHTS[tier];if(!w)return"common";
  const total=Object.values(w).reduce((a,b)=>a+b,0);
  let r=Math.random()*total;
  for(const[rar,wt]of Object.entries(w)){r-=wt;if(r<=0)return rar;}
  return"common";
}

function randomItemByTier(tier){
  const rar=weightedRarity(tier);
  const pool=ITEMS.filter(i=>i.rarity===rar);
  const fallback=ITEMS.filter(i=>R_ORDER.indexOf(i.rarity)<=R_ORDER.indexOf(rar));
  const src=pool.length?pool:fallback;
  return src[Math.floor(Math.random()*src.length)];
}

function randomPetByMinRarity(min="common"){
  const minIdx=R_ORDER.indexOf(min);
  const pool=PETS.filter(p=>R_ORDER.indexOf(p.rarity)>=minIdx);
  return pool[Math.floor(Math.random()*pool.length)];
}

function gainXPGold(xp,gold){
  S.character.gold+=gold;
  S.character.xp+=xp;
  let lvledUp=false;
  while(S.character.xp>=S.character.xpToNext){
    S.character.xp-=S.character.xpToNext;
    S.character.level++;
    S.character.xpToNext=Math.floor(S.character.xpToNext*1.5);
    lvledUp=true;
    if(S.character.level%5===0){
      S.talentPoints=(S.talentPoints||0)+1;
      setTimeout(()=>float(`🌟 Talentpunkt! (${S.talentPoints} verfügbar)`,"#fbbf24"),500);
    }
    if(S.character.level===20&&(S.prestige||0)<6)
      setTimeout(()=>float("🔰 Prestige möglich! → Profil","#f9a8d4"),900);
  }
  if(lvledUp)setTimeout(()=>{MODAL={type:"levelup"};render();},600);
  checkTitles();
}

function checkTitles(){
  // nothing to store, titles computed on render
}

function getEarnedTitles(){
  return TITLES.filter(t=>{try{return t.req(S);}catch{return false;}});
}

function getLevelTitle(l){
  const t=["Neuling","Lehrling","Abenteurer","Kämpfer","Veteran","Meister","Champion","Held","Legende","Halbgott","Gottheit"];
  return t[Math.min(Math.floor(l/5),t.length-1)];
}

function getHomeBase(){
  return[...HOME_BASES].reverse().find(h=>S.character.level>=h.lvl)||HOME_BASES[0];
}

function addLog(text){
  const time=new Date().toLocaleTimeString("de",{hour:"2-digit",minute:"2-digit"});
  S.log=[{text,time},...S.log.slice(0,49)];
}

// ── MIGRATION ───────────────────────────────────────────────────
function migrateState(){
  if(!S)return;
  if(!S.materials)S.materials={ore:0,herbs:0,magicDust:0};
  if(!S.talents)S.talents={};
  if(S.talentPoints===undefined)S.talentPoints=0;
  if(S.prestige===undefined)S.prestige=0;
  if(!S.heirlooms)S.heirlooms=[];
  if(!S.expeditions)S.expeditions={};
  if(!S.petAffection)S.petAffection={};
  if(!S.shopRotation)S.shopRotation={date:null,itemIds:[]};
  if(!S.settings)S.settings={theme:"purple",size:"normal"};
  if(!S.craftProf)S.craftProf="alchemy";
  if(!S.heimstatt)S.heimstatt={buildings:{}};
  if(!S.heimstatt.buildings)S.heimstatt.buildings={};
  if(!S.guild)S.guild={};
  if(!S._stats)S._stats={totalQuests:0,crafted:0,expeditions:0};
  // Migrate quests without repeat/notif
  const dr={type:"daily",days:[],interval:1,lastReset:null};
  const dn={enabled:false,time:"09:00"};
  S.quests=S.quests.map(q=>({...q,repeat:q.repeat||{...dr},notif:q.notif||{...dn}}));
  if(S.talents.t_hp&&!S._hpTalentApplied){S.character.maxHp+=20;S._hpTalentApplied=true;}
  const now=Date.now();
  if(S.guild&&Object.keys(S.guild).length>0){
    const lastPay=S._lastWeeklyPay||0;
    if(now-lastPay>604800000){
      let total=0;
      Object.keys(S.guild).forEach(id=>{const n=NPCS.find(x=>x.id===id);if(n)total+=n.weekly;});
      if(S.character.gold>=total){S.character.gold-=total;S._lastWeeklyPay=now;}
      else{S.guild={};float("⚠️ Gefährten aufgelöst! Kein Gold für Unterhalt.","#ef4444");}
    }
  }
  if(S.talents.t_hp&&!S._hpTalentApplied){S.character.maxHp+=20;S._hpTalentApplied=true;}
}

// Quest completion