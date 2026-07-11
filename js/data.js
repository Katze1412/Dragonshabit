'use strict';
// ═══════════════════════════════════════════════════════════════
// GAME DATA
// ═══════════════════════════════════════════════════════════════
const ATTRS={
  STR:{label:"Stärke",     icon:"💪",color:"#ef4444",cat:"fitness", desc:"Sport & körperliche Aufgaben"},
  DEX:{label:"Geschick",   icon:"🤸",color:"#f59e0b",cat:"habits",  desc:"Routinen & Gewohnheiten"},
  CON:{label:"Konstitution",icon:"❤️",color:"#22c55e",cat:"health",  desc:"Gesundheit, Schlaf & Ernährung"},
  INT:{label:"Intelligenz",icon:"🧠",color:"#6366f1",cat:"learning",desc:"Lernen, Lesen & Skills"},
  WIS:{label:"Weisheit",   icon:"🌿",color:"#14b8a6",cat:"mindful", desc:"Meditation & Reflexion"},
  CHA:{label:"Charisma",   icon:"✨",color:"#ec4899",cat:"social",  desc:"Soziales & Kreativität"},
};
const CAT_ATTR={fitness:"STR",habits:"DEX",health:"CON",learning:"INT",mindful:"WIS",social:"CHA"};
const CAT_LABEL={fitness:"💪 Fitness",habits:"🔁 Gewohnheiten",health:"❤️ Gesundheit",learning:"🧠 Lernen",mindful:"🌿 Achtsamkeit",social:"✨ Sozial"};
const CAT_COLOR={fitness:"#ef4444",habits:"#f59e0b",health:"#22c55e",learning:"#6366f1",mindful:"#14b8a6",social:"#ec4899"};

// ── CLASSLESS ARCHETYPE SYSTEM ──────────────────────────────────
const ARCHETYPES={
  // Single dominant
  STR:{name:"Krieger",      icon:"⚔️",color:"#ef4444",bonusLabel:"Fitness +1 Würfel",   diceMod:{fitness:1},  desc:"Rohe Kraft überwindet jedes Hindernis."},
  DEX:{name:"Schurke",      icon:"🗡️",color:"#f59e0b",bonusLabel:"Gewohnheiten +1 Würfel",diceMod:{habits:1}, desc:"Präzision und Routine als tödliche Waffe."},
  CON:{name:"Wächter",      icon:"🛡️",color:"#22c55e",bonusLabel:"Gesundheit +1 Würfel",diceMod:{health:1},   desc:"Unzerstörbare Ausdauer. Du gibst nie auf."},
  INT:{name:"Magier",       icon:"🔮",color:"#6366f1",bonusLabel:"Lernen +1 Würfel",    diceMod:{learning:1}, desc:"Der Geist ist die schärfste Waffe."},
  WIS:{name:"Druide",       icon:"🌿",color:"#14b8a6",bonusLabel:"Achtsamkeit +1 Würfel",diceMod:{mindful:1}, desc:"Weisheit fließt wie Wasser durch Stein."},
  CHA:{name:"Barde",        icon:"🎵",color:"#ec4899",bonusLabel:"Sozial +1 Würfel",    diceMod:{social:1},   desc:"Deine Worte bewegen Berge."},
  // All pairs
  "CON+STR":{name:"Barbar",       icon:"🪓",color:"#ef4444",bonusLabel:"+20 Max HP",        hpBonus:20,     diceMod:{fitness:1},desc:"Wildheit und Zähigkeit. Keine Wunde stoppt dich."},
  "INT+STR":{name:"Ritter-Magier",icon:"⚡",color:"#a855f7",bonusLabel:"+1 auf alle Quests",diceMod:"all",              desc:"Körper und Geist — eine seltene Kombination."},
  "STR+WIS":{name:"Paladin",      icon:"✝️",color:"#f9a8d4",bonusLabel:"Streak-Schutz passiv",streakShield:true,diceMod:{fitness:1},desc:"Heilige Kraft und eiserner Wille."},
  "CHA+STR":{name:"Herrscher",    icon:"👑",color:"#fbbf24",bonusLabel:"Gold +20% auf alle", goldBoost:.2,   diceMod:{fitness:1},desc:"Stärke und Charisma — gebürtiger Anführer."},
  "DEX+STR":{name:"Ranger",       icon:"🏹",color:"#f59e0b",bonusLabel:"Fitness & Gewohnheiten +1 Würfel",diceMod:{fitness:1,habits:1},desc:"Kraft trifft Präzision. Schnell und tödlich."},
  "CON+DEX":{name:"Mönch",        icon:"🧘",color:"#22c55e",bonusLabel:"Streak-Schutz passiv",streakShield:true,diceMod:{habits:1},desc:"Körper und Routine in perfekter Balance."},
  "INT+DEX":{name:"Assassine",    icon:"🌑",color:"#6366f1",bonusLabel:"Loot-Chance +15%",  lootBoost:.15,  diceMod:{habits:1},desc:"Präzision und Cleverness — tödlich effizient."},
  "CHA+DEX":{name:"Trickster",    icon:"🎭",color:"#ec4899",bonusLabel:"Gold +15% auf alle", goldBoost:.15,  diceMod:{habits:1},desc:"Charmant, flink, unberechenbar."},
  "DEX+WIS":{name:"Wanderer",     icon:"🌄",color:"#14b8a6",bonusLabel:"XP +15% auf alle",  xpBoost:.15,    diceMod:{habits:1},desc:"Beweglich und weise — du gehst deinen eigenen Weg."},
  "CON+INT":{name:"Alchemist",    icon:"⚗️",color:"#6366f1",bonusLabel:"Lernen & Gesundheit +1 Würfel",diceMod:{learning:1,health:1},desc:"Wissen über den Körper als Waffe."},
  "CON+WIS":{name:"Schamane",     icon:"🌿",color:"#22c55e",bonusLabel:"HP-Regen +15 täglich",hpRegen:15,   diceMod:{health:1},desc:"Körper und Natur in Einklang."},
  "CHA+CON":{name:"Anführer",     icon:"🔱",color:"#22c55e",bonusLabel:"Gold +10% & Gesundheit +1",goldBoost:.1,diceMod:{health:1},desc:"Zäh und charismatisch — andere folgen dir."},
  "INT+WIS":{name:"Weise",        icon:"📿",color:"#14b8a6",bonusLabel:"XP +10% & Lernen +1", xpBoost:.1,   diceMod:{learning:1},desc:"Wissen und Weisheit vereint."},
  "CHA+INT":{name:"Gelehrter",    icon:"📚",color:"#6366f1",bonusLabel:"Loot-Chance +10%",   lootBoost:.1,  diceMod:{learning:1},desc:"Bücher und Brillanz — Wissen ist Macht."},
  "CHA+WIS":{name:"Prophet",      icon:"🔯",color:"#ec4899",bonusLabel:"XP +20% auf alle",   xpBoost:.2,    diceMod:{mindful:1},desc:"Intuition und Charisma. Die Zukunft liegt offen vor dir."},
  // 3-way ties
  "triple-body":{name:"Kriegsherr",   icon:"🏯",color:"#ef4444",bonusLabel:"Fitness,Gewohnheiten,Gesundheit +1",diceMod:{fitness:1,habits:1,health:1},desc:"Körper, Ausdauer und Disziplin vereint. Eine lebende Legende."},
  "triple-mind":{name:"Weiser Magier",icon:"🌌",color:"#6366f1",bonusLabel:"Lernen,Achtsamkeit,Sozial +1",diceMod:{learning:1,mindful:1,social:1},desc:"Geist, Weisheit und Ausdruck. Einer, der die Wahrheit kennt."},
  "triple-mix1":{name:"Edelmann",     icon:"⚜️",color:"#a855f7",bonusLabel:"+1 auf alle Quests & Gold +10%",diceMod:"all",goldBoost:.1,desc:"Stärke, Wissen und Charisma — der vollständige Held."},
  "triple-mix2":{name:"Hüter",        icon:"🌿",color:"#22c55e",bonusLabel:"Streak-Schutz & HP-Regen",streakShield:true,hpRegen:10,desc:"Wächter von Körper und Seele."},
  // 4-5 tied
  "quad+":    {name:"Halbgott",       icon:"🌟",color:"#fbbf24",bonusLabel:"+2 auf alle Quests & XP +20%",diceMod:"all2",xpBoost:.2,desc:"Jenseits des Gewöhnlichen. Du transzendierst jede Klasse."},
  // All 6 maxed
  "all6":     {name:"Gottheit",       icon:"💫",color:"#f9a8d4",bonusLabel:"+3 auf alle Quests & alles ×1.5",diceMod:"all3",xpBoost:.5,goldBoost:.5,desc:"Die Götter verbeugen sich. Du hast alles erreicht."},
};

function getArchetype(){
  // Manual override — player explicitly chose
  if(S.chosenArchetype){
    const a=ARCHETYPES[S.chosenArchetype];
    if(a)return{...a,key:S.chosenArchetype,manuallyChosen:true};
  }
  const attrs=computedAttrs();
  const max=Math.max(...Object.values(attrs));
  // All attrs within 2 of the max are "dominant"
  const dominant=Object.entries(attrs).filter(([,v])=>v>=max-2).map(([k])=>k).sort();
  const n=dominant.length;

  // 6 dominant → Gottheit
  if(n>=6)return{...ARCHETYPES["all6"],key:"all6"};

  // 4-5 dominant → Halbgott
  if(n>=4)return{...ARCHETYPES["quad+"],key:"quad+"};

  // 3 dominant → pick by which triple it is
  if(n===3){
    const bodyAttrs=["STR","DEX","CON"];
    const mindAttrs=["INT","WIS","CHA"];
    const isBody=dominant.every(a=>bodyAttrs.includes(a));
    const isMind=dominant.every(a=>mindAttrs.includes(a));
    if(isBody)return{...ARCHETYPES["triple-body"],key:"triple-body"};
    if(isMind)return{...ARCHETYPES["triple-mind"],key:"triple-mind"};
    // Mixed triples — pick the best pair from the three
    const pairs=[];
    for(let i=0;i<dominant.length;i++)for(let j=i+1;j<dominant.length;j++){
      const key=[dominant[i],dominant[j]].join("+");
      if(ARCHETYPES[key])pairs.push({key,arch:ARCHETYPES[key]});
    }
    if(pairs.length){
      // prefer a hybrid with the most bonuses
      return{...pairs[0].arch,key:pairs[0].key};
    }
    return{...ARCHETYPES["triple-mix1"],key:"triple-mix1"};
  }

  // 2 dominant → hybrid
  if(n===2){
    const key=dominant.join("+");
    if(ARCHETYPES[key])return{...ARCHETYPES[key],key};
    // fallback: try reverse order (shouldn't happen since we .sort())
    const keyR=[...dominant].reverse().join("+");
    if(ARCHETYPES[keyR])return{...ARCHETYPES[keyR],key:keyR};
  }

  // 1 dominant → single
  const top=dominant[0]||Object.entries(attrs).sort((a,b)=>b[1]-a[1])[0][0];
  return{...ARCHETYPES[top],key:top};
}

function getAvailableArchetypes(){
  // Returns all archetypes the player qualifies for (within 2 of max, all combos)
  const attrs=computedAttrs();
  const max=Math.max(...Object.values(attrs));
  const dominant=Object.entries(attrs).filter(([,v])=>v>=max-2).map(([k])=>k).sort();
  const available=[];

  // Always include auto-detected one
  const auto=getArchetype();
  available.push({...auto,auto:true});

  // Add all valid singles from dominant attrs
  dominant.forEach(a=>{
    if(!available.find(x=>x.key===a))available.push({...ARCHETYPES[a],key:a});
  });

  // Add all valid pairs from dominant
  for(let i=0;i<dominant.length;i++){
    for(let j=i+1;j<dominant.length;j++){
      const key=[dominant[i],dominant[j]].join("+");
      if(ARCHETYPES[key]&&!available.find(x=>x.key===key))available.push({...ARCHETYPES[key],key});
    }
  }

  // Add triples/multi if dominant has 3+
  if(dominant.length>=3){
    ["triple-body","triple-mind","triple-mix1","triple-mix2"].forEach(k=>{
      if(ARCHETYPES[k]&&!available.find(x=>x.key===k))available.push({...ARCHETYPES[k],key:k});
    });
  }
  if(dominant.length>=4&&!available.find(x=>x.key==="quad+"))available.push({...ARCHETYPES["quad+"],key:"quad+"});
  if(dominant.length>=6&&!available.find(x=>x.key==="all6"))available.push({...ARCHETYPES["all6"],key:"all6"});

  return available.slice(0,8); // max 8 choices
}

function renderArchetypePicker(){
  const available=getAvailableArchetypes();
  const current=getArchetype();
  return`<div class="overlay" onclick="closeModal()">
    <div class="modal" onclick="event.stopPropagation()" style="max-height:85vh;overflow-y:auto">
      <div style="text-align:center;margin-bottom:14px">
        <div style="font-size:28px;margin-bottom:4px">⚡</div>
        <div class="cinzel" style="font-size:15px;color:#c4b5fd;font-weight:700">ARCHETYP WÄHLEN</div>
        <div style="font-size:10px;color:#4b5563;margin-top:2px">Basiert auf deinen stärksten Attributen</div>
      </div>
      ${available.map(arch=>{
        const isCurrent=arch.key===current.key;
        return`<div onclick="chooseArchetype('${arch.key}')" style="background:${isCurrent?arch.color+"22":"#0d0b1e"};border:1px solid ${isCurrent?arch.color:"#2d2a6e"};border-radius:11px;padding:11px 13px;margin-bottom:8px;cursor:pointer;transition:all .2s">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:24px">${arch.icon}</div>
            <div style="flex:1">
              <div class="cinzel" style="font-size:13px;color:${arch.color};font-weight:700">${arch.name} ${isCurrent?"✓":""}</div>
              <div style="font-size:10px;color:#6b7280;margin-top:1px">${arch.desc}</div>
              <div style="font-size:9px;color:${arch.color};margin-top:4px;background:${arch.color}11;border-radius:6px;padding:2px 7px;display:inline-block">⚡ ${arch.bonusLabel}</div>
            </div>
          </div>
        </div>`;
      }).join("")}
      ${S.chosenArchetype?`<button onclick="chooseArchetype(null)" style="width:100%;padding:8px;border-radius:9px;border:1px solid #374151;background:transparent;color:#6b7280;font-size:11px;margin-top:4px">↩ Automatisch bestimmen</button>`:""}
    </div>
  </div>`;
}

function getArchetypeDiceMod(cat){
  const arch=getArchetype();
  if(arch.diceMod==="all3")return 3;
  if(arch.diceMod==="all2")return 2;
  if(arch.diceMod==="all")return 1;
  if(arch.diceMod&&arch.diceMod[cat])return arch.diceMod[cat];
  return 0;
}

// ── DAILY EVENTS ────────────────────────────────────────────────
const DAILY_EVENTS=[
  {id:"e1", icon:"☀️",title:"Goldener Tag",       color:"#fbbf24",desc:"Die Sonne strahlt auf deine Taten. Alle Goldbelohnungen heute ×1.5.",effect:"goldboost1.5",story:"Der Morgen leuchtet golden. Schicksal lächelt."},
  {id:"e2", icon:"🌙",title:"Mondnacht-Bonus",    color:"#a78bfa",desc:"WIS-Quests geben heute +50% XP.",effect:"xpboost:mindful",story:"Der Mond flüstert Geheimnisse. Hör genau hin."},
  {id:"e3", icon:"⚡",title:"Sturmtag",           color:"#6366f1",desc:"+2 auf alle Würfelwürfe heute.",effect:"dicemod+2",story:"Der Sturm peitscht. Doch du stehst."},
  {id:"e4", icon:"🌿",title:"Naturtag",           color:"#22c55e",desc:"HP wird vollständig regeneriert.",effect:"hpfull",story:"Die Erde heilt. Deine Wunden schließen sich."},
  {id:"e5", icon:"💀",title:"Verfluchter Tag",    color:"#ef4444",desc:"-2 auf alle Würfelwürfe heute. Halte durch!",effect:"dicemod-2",story:"Eine dunkle Wolke hängt über dir. Kämpf dagegen an."},
  {id:"e6", icon:"🎲",title:"Schicksalstag",      color:"#f9a8d4",desc:"Nat 20 Chance verdoppelt. Nat 1 Chance auch.",effect:"fateful",story:"Das Schicksal würfelt mit. Alles ist möglich."},
  {id:"e7", icon:"🪙",title:"Händler-Besuch",     color:"#fbbf24",desc:"Ein wandernder Händler schenkt dir 25 Gold.",effect:"gold+25",story:"Ein Fremder lächelt, drückt dir eine Münze in die Hand."},
  {id:"e8", icon:"🐾",title:"Tier-Wanderung",     color:"#14b8a6",desc:"Heute erhöhte Chance ein Haustier zu finden.",effect:"petboost",story:"Ein wildes Tier beobachtet dich neugierig."},
  {id:"e9", icon:"📜",title:"Alte Schriftrolle",  color:"#6366f1",desc:"INT-Quests geben heute +50% XP.",effect:"xpboost:learning",story:"Eine vergilbte Rolle liegt vor deiner Tür. Uraltes Wissen."},
  {id:"e10",icon:"🔥",title:"Feuerprobe",         color:"#ef4444",desc:"STR-Quests geben heute ×2 XP und Gold.",effect:"doubleboost:fitness",story:"Heute wirst du getestet. Das Feuer formt den Stahl."},
  {id:"e11",icon:"🌈",title:"Glücksregen",        color:"#f9a8d4",desc:"Zufälliges Item beim ersten Quest heute.",effect:"freeitem",story:"Aus heiterem Himmel fällt ein Segen auf dich."},
  {id:"e12",icon:"🛡️",title:"Tag der Stärke",    color:"#22c55e",desc:"Streak-Schutz heute aktiv.",effect:"streakshield",story:"Heute bricht nichts. Dein Wille ist unzerstörbar."},
  {id:"e13",icon:"🌑",title:"Stiller Tag",        color:"#374151",desc:"Kein besonderes Ereignis. Nur du und deine Quests.",effect:"none",story:"Manche Tage sind einfach Tage. Und das ist gut so."},
  {id:"e14",icon:"💫",title:"Sternentag",         color:"#f9a8d4",desc:"Alle XP-Belohnungen heute +20%.",effect:"xpall+20",story:"Die Sterne stehen günstig. Nutze es."},
  {id:"e15",icon:"⚔️",title:"Kriegertag",        color:"#ef4444",desc:"Boss-DC heute -3. Perfekt für Dungeon-Angriff.",effect:"bossdc-3",story:"Dein Schwert ist heute leichter."},
  {id:"e16",icon:"⚗️",title:"Tag der Alchemie",  color:"#a78bfa",desc:"Materialien aus Quests heute ×2.",effect:"doubleMat",story:"Die Elemente gehorchen dir."},
];

function rollDailyEvent(){
  const ev=DAILY_EVENTS[Math.floor(Math.random()*DAILY_EVENTS.length)];
  applyDailyEffect(ev.effect);
  S.dailyEvent={...ev,date:new Date().toDateString()};
  return ev;
}

function applyDailyEffect(eff){
  if(!S.buffs)S.buffs={};
  if(eff==="goldboost1.5")S.buffs.goldboost=1.5;
  if(eff==="xpboost:mindful")S.buffs.xpboostCat="mindful";
  if(eff==="xpboost:learning")S.buffs.xpboostCat="learning";
  if(eff==="dicemod+2")S.buffs.dicemod=(S.buffs.dicemod||0)+2;
  if(eff==="dicemod-2")S.buffs.dicemod=(S.buffs.dicemod||0)-2;
  if(eff==="hpfull"){S.character.hp=S.character.maxHp;}
  if(eff==="fateful")S.buffs.fateful=true;
  if(eff==="gold+25"){S.character.gold+=25;}
  if(eff==="petboost")S.buffs.petboost=true;
  if(eff==="doubleboost:fitness"){S.buffs.doubleboostCat="fitness";}
  if(eff==="freeitem"){const i=randomItemByTier("good");if(i)S.inventory.push({...i,uid:Date.now()});}
  if(eff==="streakshield")S.buffs.streakshield=true;
  if(eff==="xpall+20")S.buffs.xpallBoost=.2;
  if(eff==="bossdc-3")S.buffs.bossDCmod=-3;
  if(eff==="doubleMat")S.buffs.doubleMatDay=true;
}

const RARITIES={
  common:  {label:"Gewöhnlich",  color:"#9ca3af",glow:"#9ca3af33",border:"#374151"},
  uncommon:{label:"Ungewöhnlich",color:"#22c55e",glow:"#22c55e33",border:"#166534"},
  rare:    {label:"Selten",      color:"#6366f1",glow:"#6366f133",border:"#3730a3"},
  epic:    {label:"Episch",      color:"#a855f7",glow:"#a855f733",border:"#6b21a8"},
  legendary:{label:"Legendär",  color:"#f59e0b",glow:"#f59e0b44",border:"#92400e"},
  mystic:  {label:"Mystisch",    color:"#f9a8d4",glow:"#f9a8d466",border:"#9d174d"},
};
const R_ORDER=["common","uncommon","rare","epic","legendary","mystic"];

const LOOT={
  1:     {tier:"fail",  label:"Fehlschlag!",        icon:"💀",xpM:0,  goldM:0,  iC:0,   pC:0,   color:"#ef4444",story:["Du stolperst und lässt alles fallen...","Nicht dein Tag.","Der Schatten lacht."]},
  "2-9": {tier:"normal",label:"Erfolg",             icon:"⚔️",xpM:.8, goldM:.8, iC:.06, pC:0,   color:"#9ca3af",story:["Solide Arbeit, Held.","Gut gemacht.","Du hältst Schritt."]},
  "10-14":{tier:"good", label:"Guter Treffer!",     icon:"✨",xpM:1,  goldM:1,  iC:.18, pC:.03, color:"#6366f1",story:["Die Götter nicken.","Stärker als gestern.","Dein Weg wird heller."]},
  "15-19":{tier:"great",label:"Großer Erfolg!",     icon:"⭐",xpM:1.5,goldM:1.5,iC:.35, pC:.08, color:"#f59e0b",story:["Die Sterne stehen gut!","Legendenwerdig!","Das Schicksal begünstigt dich."]},
  20:    {tier:"nat20", label:"NAT 20 — GÖTTLICH!", icon:"💫",xpM:3,  goldM:3,  iC:.75, pC:.25, color:"#f9a8d4",story:["DIE GÖTTER SCHREIEN DEINEN NAMEN!","UNVERGESSLICH!","Das Universum verbeugt sich!"]},
};
const R_WEIGHTS={
  fail:{},
  normal:{common:70,uncommon:25,rare:5,epic:0,legendary:0,mystic:0},
  good:{common:45,uncommon:35,rare:15,epic:4,legendary:1,mystic:0},
  great:{common:20,uncommon:30,rare:30,epic:14,legendary:5,mystic:1},
  nat20:{common:5,uncommon:15,rare:25,epic:28,legendary:20,mystic:7},
};

const PETS=[
  {id:"p1",name:"Feuerfuchs",  icon:"🦊",rarity:"common",   evo:["🦊","🔥🦊","⚡🦊"],ability:"STR +2",effect:{STR:2},  lore:"Er wärmt dich für den Kampf. Sein Fell brennt nie."},
  {id:"p2",name:"Mondkatze",   icon:"🐱",rarity:"uncommon", evo:["🐱","🌙🐱","👑🐱"],ability:"WIS +3",effect:{WIS:3},  lore:"Sieht das Unsichtbare. Hört das Ungehörte."},
  {id:"p3",name:"Kristallbär", icon:"🐻",rarity:"rare",     evo:["🐻","💎🐻","🔮🐻"],ability:"CON +4",effect:{CON:4},  lore:"Unerschütterliche Stärke aus dem Herzen des Berges."},
  {id:"p4",name:"Sturmadler",  icon:"🦅",rarity:"epic",     evo:["🦅","⚡🦅","🌩️🦅"],ability:"DEX +5",effect:{DEX:5},  lore:"Schneller als der Wind, älter als der Donner."},
  {id:"p5",name:"Sterndrache", icon:"🐲",rarity:"legendary",evo:["🐲","🌟🐲","💫🐲"],ability:"INT +6",effect:{INT:6},  lore:"Trägt das Wissen aller vergangenen Zeitalter."},
  {id:"p6",name:"Mondphönix",  icon:"🦄",rarity:"mystic",   evo:["🦄","🌈🦄","✨🦄"],ability:"+2 alle",effect:{STR:2,DEX:2,CON:2,INT:2,WIS:2,CHA:2},lore:"Jenseits von Legende. Jenseits von Mythos."},
  {id:"p7",name:"Erdwurm",     icon:"🐛",rarity:"common",   evo:["🐛","🦋","🌈🦋"],  ability:"DEX +1",effect:{DEX:1},  lore:"Klein. Ausdauernd. Unterschätzt."},
  {id:"p8",name:"Geistfisch",  icon:"🐟",rarity:"uncommon", evo:["🐟","🌊🐟","💙🐟"],ability:"WIS +2",effect:{WIS:2},  lore:"Schwimmt zwischen den Welten."},
];

const ITEMS=[
  // Common — keine Anforderung
  {id:"i1", name:"Holzschwert",      icon:"🗡️",slot:"weapon", rarity:"common",   stats:{STR:1},   req:null, archReq:null},
  {id:"i2", name:"Lederrüstung",     icon:"🧥",slot:"armor",  rarity:"common",   stats:{CON:1},   req:null, archReq:null},
  {id:"i3", name:"Glücksamulett",    icon:"🔮",slot:"trinket",rarity:"uncommon", stats:{DEX:2,CHA:1},req:null,archReq:null},
  {id:"i4", name:"Weisheitsring",    icon:"💍",slot:"ring",   rarity:"uncommon", stats:{INT:2,WIS:1},req:null,archReq:null},
  // Uncommon — keine Anforderung
  {id:"i5", name:"Wanderstiefel",    icon:"👢",slot:"armor",  rarity:"uncommon", stats:{DEX:2,CON:1},req:null,archReq:null},
  {id:"i6", name:"Silberamulett",    icon:"🪬",slot:"trinket",rarity:"uncommon", stats:{WIS:2,CHA:1},req:null,archReq:null},
  // Rare — keine Anforderung
  {id:"i7", name:"Drachenschuppe",   icon:"🛡️",slot:"armor",  rarity:"rare",     stats:{CON:4,STR:2},req:null,archReq:null},
  {id:"i8", name:"Magierstab",       icon:"🪄",slot:"weapon", rarity:"rare",     stats:{INT:3,WIS:2},req:null,archReq:null},
  {id:"i9", name:"Jägerkappe",       icon:"🎩",slot:"helmet", rarity:"rare",     stats:{DEX:3,INT:1},req:null,archReq:null},
  // Epic — benötigt 12 im höchsten Stat des Items
  {id:"i10",name:"Sturmbogen",       icon:"🏹",slot:"weapon", rarity:"epic",     stats:{DEX:5,STR:2},req:{DEX:12},archReq:null},
  {id:"i11",name:"Phönixfeder",      icon:"🪶",slot:"trinket",rarity:"epic",     stats:{CHA:4,WIS:3},req:{CHA:12},archReq:null},
  {id:"i12",name:"Arkaner Fokus",    icon:"💎",slot:"ring",   rarity:"epic",     stats:{INT:5,WIS:2},req:{INT:12},archReq:null},
  {id:"i13",name:"Eisenherz",        icon:"❤️‍🔥",slot:"armor", rarity:"epic",     stats:{CON:6,STR:3},req:{CON:12},archReq:null},
  // Legendary — benötigt 14 im höchsten Stat + Archetyp-Vorschlag
  {id:"i14",name:"Titanhandschuh",   icon:"🥊",slot:"weapon", rarity:"legendary",stats:{STR:8,CON:3},req:{STR:14},archReq:["Krieger","Barbar","Ritter-Magier","Ranger","Kriegsherr"]},
  {id:"i15",name:"Sternenkrone",     icon:"👑",slot:"helmet", rarity:"legendary",stats:{INT:6,WIS:4,CHA:4},req:{INT:14},archReq:["Magier","Weise","Gelehrter","Weiser Magier"]},
  {id:"i16",name:"Geisterleder",     icon:"🥷",slot:"armor",  rarity:"legendary",stats:{DEX:7,CHA:3},req:{DEX:14},archReq:["Schurke","Trickster","Ranger","Assassine"]},
  {id:"i17",name:"Naturherz",        icon:"🌿",slot:"trinket",rarity:"legendary",stats:{WIS:8,CON:3},req:{WIS:14},archReq:["Druide","Mönch","Schamane","Prophet","Wächter"]},
  // Mystic — benötigt 15 in zwei Stats
  {id:"i18",name:"Weltenseele",      icon:"🌌",slot:"trinket",rarity:"mystic",   stats:{STR:5,DEX:5,CON:5,INT:5,WIS:5,CHA:5},req:{STR:15,INT:15},archReq:null},
  // ── KLASSENSPEZIFISCHE ITEMS ──────────────────────────────────
  // Krieger
  {id:"c1", name:"Kriegsaxt",        icon:"🪓",slot:"weapon", rarity:"rare",     stats:{STR:5,CON:2},req:{STR:12},archReq:["Krieger","Barbar","Ritter-Magier","Kriegsherr"],classItem:true},
  {id:"c2", name:"Schild der Ehre",  icon:"🛡️",slot:"armor",  rarity:"epic",     stats:{CON:6,STR:4},req:{STR:12,CON:12},archReq:["Krieger","Wächter","Paladin","Barbar"],classItem:true},
  // Magier
  {id:"c3", name:"Arkanspellbuch",   icon:"📖",slot:"trinket",rarity:"rare",     stats:{INT:5,WIS:3},req:{INT:12},archReq:["Magier","Weise","Ritter-Magier","Gelehrter","Weiser Magier"],classItem:true},
  {id:"c4", name:"Magierhut",        icon:"🧙",slot:"helmet", rarity:"epic",     stats:{INT:6,CHA:3},req:{INT:12},archReq:["Magier","Gelehrter","Weiser Magier"],classItem:true},
  // Schurke
  {id:"c5", name:"Schattendolch",    icon:"🔪",slot:"weapon", rarity:"rare",     stats:{DEX:5,CHA:2},req:{DEX:12},archReq:["Schurke","Assassine","Trickster"],classItem:true},
  {id:"c6", name:"Nebelumhang",      icon:"🌫️",slot:"armor",  rarity:"epic",     stats:{DEX:6,CHA:3},req:{DEX:12},archReq:["Schurke","Trickster","Ranger","Assassine"],classItem:true},
  // Druide
  {id:"c7", name:"Mondstab",         icon:"🌙",slot:"weapon", rarity:"rare",     stats:{WIS:5,CON:2},req:{WIS:12},archReq:["Druide","Mönch","Schamane","Prophet"],classItem:true},
  {id:"c8", name:"Naturkrone",       icon:"🌿",slot:"helmet", rarity:"epic",     stats:{WIS:6,CON:3},req:{WIS:12},archReq:["Druide","Schamane","Hüter"],classItem:true},
  // Barde
  {id:"c9", name:"Silberlaute",      icon:"🎸",slot:"trinket",rarity:"rare",     stats:{CHA:5,WIS:2},req:{CHA:12},archReq:["Barde","Trickster","Prophet","Herrscher"],classItem:true},
  {id:"c10",name:"Mantel des Charmes",icon:"🎭",slot:"armor", rarity:"epic",     stats:{CHA:6,INT:3},req:{CHA:12},archReq:["Barde","Gelehrter","Prophet","Herrscher"],classItem:true},
  // Halbgott / Gottheit
  {id:"c11",name:"Halbgott-Rüstung", icon:"⚜️",slot:"armor",  rarity:"legendary",stats:{STR:5,DEX:5,CON:5},req:{STR:14,DEX:14},archReq:["Halbgott","Gottheit"],classItem:true},
  {id:"c12",name:"Krone der Götter", icon:"✨",slot:"helmet", rarity:"mystic",   stats:{INT:8,WIS:8,CHA:8},req:{INT:15,WIS:15},archReq:["Gottheit"],classItem:true},
];

const SHOP_ITEMS=[
  {id:"sh1", name:"Heiltrank",           icon:"🧪",cost:15, type:"consumable",desc:"Stellt 30 HP wieder her",         eff:"hp+30"},
  {id:"sh2", name:"Großer Heiltrank",    icon:"💉",cost:35, type:"consumable",desc:"Stellt 80 HP wieder her",         eff:"hp+80"},
  {id:"sh3", name:"XP-Elixier",          icon:"⚗️",cost:40, type:"consumable",desc:"+50 XP sofort",                  eff:"xp+50"},
  {id:"sh4", name:"Goldtrank",           icon:"🍶",cost:30, type:"consumable",desc:"Nächste Quest: +100% Gold",       eff:"goldboost"},
  {id:"sh5", name:"Glückszauber",        icon:"🍀",cost:25, type:"consumable",desc:"+3 auf nächsten Würfelwurf",      eff:"dicemod+3"},
  {id:"sh6", name:"Streak-Schutz",       icon:"🛡️",cost:50, type:"consumable",desc:"Nächste Niederlage: Streak bleibt",eff:"streakshield"},
  {id:"sh7", name:"Lootbox",             icon:"📦",cost:20, type:"lootbox",   desc:"Zufälliges Item (Normal)",        eff:"loot:normal"},
  {id:"sh8", name:"Lootbox (Selten)",    icon:"💜",cost:60, type:"lootbox",   desc:"Höhere Chance auf Rare+",         eff:"loot:great"},
  {id:"sh9", name:"Mystische Lootbox",   icon:"🌌",cost:150,type:"lootbox",   desc:"Nat-20 Gewichtungen!",            eff:"loot:nat20"},
  {id:"sh10",name:"Haustier-Ei",         icon:"🥚",cost:80, type:"lootbox",   desc:"Zufälliges Haustier",             eff:"pet:common"},
  {id:"sh11",name:"Seltenes Haustier-Ei",icon:"🔮",cost:200,type:"lootbox",   desc:"Haustier (Rare+)",                eff:"pet:rare"},
  {id:"sh12",name:"STR-Tome",            icon:"📕",cost:100,type:"upgrade",   desc:"STR dauerhaft +1",                eff:"attr:STR+1"},
  {id:"sh13",name:"INT-Tome",            icon:"📘",cost:100,type:"upgrade",   desc:"INT dauerhaft +1",                eff:"attr:INT+1"},
  {id:"sh14",name:"WIS-Tome",            icon:"📗",cost:100,type:"upgrade",   desc:"WIS dauerhaft +1",                eff:"attr:WIS+1"},
  {id:"sh15",name:"Max-HP Upgrade",      icon:"❤️",cost:75, type:"upgrade",   desc:"Max HP dauerhaft +20",            eff:"maxhp+20"},
];

// ── NEW SYSTEMS DATA ────────────────────────────────────────────
const MATERIALS={ore:{name:"Erz",icon:"🪨",color:"#9ca3af"},herbs:{name:"Kräuter",icon:"🌿",color:"#22c55e"},magicDust:{name:"Magestaub",icon:"✨",color:"#a78bfa"}};
const MAT_KEYS=["ore","herbs","magicDust"];
const CRAFTING_RECIPES=[
  {id:"r1",prof:"alchemy", name:"Heiltrank+",     icon:"🧪",cost:{herbs:2},             eff:"hp+60",          desc:"Stellt 60 HP her"},
  {id:"r2",prof:"alchemy", name:"Würfelelixier",  icon:"⚗️",cost:{herbs:2,magicDust:1}, eff:"dicemod+3",      desc:"+3 auf nächste Würfe"},
  {id:"r3",prof:"alchemy", name:"Goldtrank",      icon:"🍶",cost:{herbs:3,ore:1},        eff:"goldboost",      desc:"Nächste Quest ×2 Gold"},
  {id:"r4",prof:"smithing",name:"Schwert",         icon:"⚔️",cost:{ore:4},              eff:"item:craft_sword",desc:"STR+4 CON+1"},
  {id:"r5",prof:"smithing",name:"Kettenhemd",      icon:"🛡️",cost:{ore:5},              eff:"item:craft_armor",desc:"CON+4 STR+1"},
  {id:"r6",prof:"smithing",name:"Erzkrone",        icon:"⛏️",cost:{ore:4,magicDust:1},   eff:"item:craft_helm", desc:"DEX+3 CON+2"},
  {id:"r7",prof:"scribing",name:"XP-Rolle",        icon:"📜",cost:{magicDust:2},         eff:"xp+80",          desc:"+80 XP sofort"},
  {id:"r8",prof:"scribing",name:"Attributsrolle",  icon:"📿",cost:{magicDust:3,herbs:1}, eff:"attr:rnd+1",     desc:"Zufällig. Attribut +1"},
  {id:"r9",prof:"scribing",name:"Schicksalskarte", icon:"🗺️",cost:{magicDust:2,ore:1},   eff:"dicemod+5",      desc:"+5 auf nächsten Wurf"},
];
const CRAFTED_ITEMS={
  craft_sword:{id:"cs1",name:"Geschmiedetes Schwert",icon:"⚔️",slot:"weapon",rarity:"rare",stats:{STR:4,CON:1},req:null,archReq:null},
  craft_armor:{id:"cs2",name:"Kettenhemd",           icon:"🛡️",slot:"armor", rarity:"rare",stats:{CON:4,STR:1},req:null,archReq:null},
  craft_helm: {id:"cs3",name:"Erzkrone",             icon:"⛏️",slot:"helmet",rarity:"rare",stats:{DEX:3,CON:2},req:null,archReq:null},
};
const SHOP_MAT_PACKS=[
  {id:"mp1",name:"Erz ×3",       icon:"🪨",cost:20,eff:"mat:ore:3",       desc:"3 Erz"},
  {id:"mp2",name:"Kräuter ×3",   icon:"🌿",cost:18,eff:"mat:herbs:3",     desc:"3 Kräuter"},
  {id:"mp3",name:"Magestaub ×3", icon:"✨",cost:25,eff:"mat:magicDust:3", desc:"3 Magestaub"},
  {id:"mp4",name:"Mix-Paket",    icon:"🎒",cost:50,eff:"mat:mixed",        desc:"2+2+1 alle Materialien"},
];
const RARITY_SHOP_PRICES={common:25,uncommon:55,rare:110,epic:220,legendary:440,mystic:900};
const TALENT_TREE=[
  {id:"t_crit", branch:"combat",   name:"Scharfes Auge",    icon:"👁️",cost:1,desc:"19 = Nat-20 Effekt",       color:"#ef4444"},
  {id:"t_dice", branch:"combat",   name:"Kampferfahren",    icon:"🎲",cost:1,desc:"+1 perm. Würfelbonus",     color:"#ef4444"},
  {id:"t_hp",   branch:"combat",   name:"Kriegerblut",      icon:"❤️",cost:1,desc:"Max HP +20 permanent",    color:"#ef4444"},
  {id:"t_gold", branch:"wealth",   name:"Händlergeist",     icon:"🪙",cost:1,desc:"+5% Gold aus Quests",     color:"#fbbf24"},
  {id:"t_loot", branch:"wealth",   name:"Glücksfund",       icon:"🍀",cost:1,desc:"+8% Loot-Chance",         color:"#fbbf24"},
  {id:"t_sell", branch:"wealth",   name:"Marktkenner",      icon:"🏪",cost:1,desc:"Verkauf +25% Wert",        color:"#fbbf24"},
  {id:"t_mat",  branch:"crafting", name:"Erfahrener Sammler",icon:"⛏️",cost:1,desc:"Doppelter Mat.-Drop (20%)",color:"#a78bfa"},
  {id:"t_craft",branch:"crafting", name:"Meisterhandwerker",icon:"🔨",cost:1,desc:"Rezepte -1 Material",      color:"#a78bfa"},
  {id:"t_exp",  branch:"crafting", name:"Expeditionsmeister",icon:"🗺️",cost:1,desc:"Expeditionen +25%",       color:"#a78bfa"},
];
const PRESTIGE_ICONS=["","🔰","⭐","🌟","💎","👑","🌌"];
const PRESTIGE_HEIRLOOMS=[
  {id:"h1",name:"Erbe des Kriegers",icon:"⚔️",slot:"weapon", rarity:"legendary",stats:{STR:5,CON:3,DEX:2},req:null,archReq:null,heirloom:true},
  {id:"h2",name:"Erbe der Weisheit",icon:"📿",slot:"trinket",rarity:"legendary",stats:{INT:5,WIS:4,CHA:2},req:null,archReq:null,heirloom:true},
  {id:"h3",name:"Erbe der Schatten",icon:"🌑",slot:"armor",  rarity:"legendary",stats:{DEX:6,CHA:3,CON:2},req:null,archReq:null,heirloom:true},
  {id:"h4",name:"Uraltes Erbe",     icon:"🌌",slot:"trinket",rarity:"mystic",   stats:{STR:4,DEX:4,CON:4,INT:4,WIS:4,CHA:4},req:null,archReq:null,heirloom:true},
];

// ── HEIMSTATT BUILDINGS ──────────────────────────────────────────
const HEIMSTATT_BUILDINGS=[
  {id:"b1",name:"Bibliothek",     icon:"📚",cost:150,desc:"INT-Quests +15% XP",            effect:"intXp+15",  color:"#6366f1",req:null},
  {id:"b2",name:"Trainingsplatz", icon:"🏋️",cost:150,desc:"STR-Quests +15% XP",            effect:"strXp+15",  color:"#ef4444",req:null},
  {id:"b3",name:"Alchemielabor",  icon:"⚗️",cost:200,desc:"Trank-Wirkung ×1.5 & -1 Kraut", effect:"alchemyBoost",color:"#a78bfa",req:null},
  {id:"b4",name:"Schatzkammer",   icon:"🏦",cost:200,desc:"+15 Gold pro Tag (auto bei Tagesstart)",effect:"dailyGold+15",color:"#fbbf24",req:null},
  {id:"b5",name:"Heiligtum",      icon:"⛪",cost:250,desc:"WIS & CON Quests +15% XP",      effect:"wisXp+15",  color:"#14b8a6",req:"b1"},
  {id:"b6",name:"Waffenschmiede", icon:"🔨",cost:250,desc:"Schmied-Rezepte -1 Erz",         effect:"smithDiscount",color:"#9ca3af",req:"b2"},
  {id:"b7",name:"Wachturm",       icon:"🗼",cost:300,desc:"+10% Loot-Chance auf alle Quests",effect:"watchLoot+10",color:"#f59e0b",req:null},
  {id:"b8",name:"Arkane Kammer",  icon:"🔮",cost:400,desc:"Magestaub-Drop +1 bei Quests",   effect:"extraDust", color:"#c084fc",req:"b5"},
  {id:"b9",name:"Gasthaus",       icon:"🍺",cost:300,desc:"Tägl. HP-Regen +20",             effect:"dailyHp+20",color:"#22c55e",req:null},
];

// ── NPCS / GEFÄHRTEN ─────────────────────────────────────────────
const NPCS=[
  {id:"n1",name:"Knappe Erich",     icon:"🛡️",hire:30, weekly:15,desc:"Loot-Chance +6% auf alle Quests",  effect:"loot+6",  color:"#9ca3af"},
  {id:"n2",name:"Mentorin Lyra",    icon:"🎓",hire:50, weekly:25,desc:"Alle XP-Belohnungen +10%",          effect:"xp+10",   color:"#6366f1"},
  {id:"n3",name:"Händlerin Mira",   icon:"🧑‍💼",hire:40, weekly:20,desc:"Shopkäufe 10% günstiger",          effect:"shopDiscount",color:"#fbbf24"},
  {id:"n4",name:"Alchemist Torben", icon:"⚗️",hire:60, weekly:30,desc:"Alchemie-Rezepte kosten -1 Kraut",  effect:"alchDiscount",color:"#a78bfa"},
  {id:"n5",name:"Späher Finn",      icon:"🏹",hire:45, weekly:22,desc:"Expeditionen +1 zufälliges Material",effect:"expBonus",color:"#14b8a6"},
];

// ── ACHIEVEMENTS ─────────────────────────────────────────────────
const ACHIEVEMENTS=[
  {id:"ac1", name:"Erster Schritt",      icon:"👣",desc:"Erste Quest abgeschlossen",             check:s=>(s._stats?.totalQuests||0)>=1},
  {id:"ac2", name:"Fleißig",             icon:"⚔️",desc:"10 Quests abgeschlossen",              check:s=>(s._stats?.totalQuests||0)>=10},
  {id:"ac3", name:"Nat-20-Legende",      icon:"💫",desc:"Ersten Nat-20 gewürfelt",               check:s=>(s.nat20Count||0)>=1},
  {id:"ac4", name:"Fünffache Gnade",     icon:"🌟",desc:"5× Nat-20 gewürfelt",                   check:s=>(s.nat20Count||0)>=5},
  {id:"ac5", name:"Zoowärter",           icon:"🐾",desc:"3 Haustiere gesammelt",                 check:s=>s.zoo.length>=3},
  {id:"ac6", name:"Menagerie",           icon:"🦄",desc:"6 Haustiere gesammelt",                 check:s=>s.zoo.length>=6},
  {id:"ac7", name:"Ausgerüstet",         icon:"🛡️",desc:"3 Item-Slots belegt",                 check:s=>Object.values(s.character.equipment).filter(Boolean).length>=3},
  {id:"ac8", name:"Vollständig",         icon:"👑",desc:"Alle 5 Item-Slots belegt",              check:s=>Object.values(s.character.equipment).filter(Boolean).length>=5},
  {id:"ac9", name:"Reicher Händler",     icon:"🪙",desc:"500 Gold besessen",                    check:s=>s.character.gold>=500},
  {id:"ac10",name:"Dungeon-Bezwinger",   icon:"🏆",desc:"Ersten Boss besiegt",                   check:s=>s.dungeons.some(d=>d.bossKilled)},
  {id:"ac11",name:"Alle Dungeons",       icon:"🏯",desc:"Alle 3 Bosse besiegt",                  check:s=>s.dungeons.every(d=>d.bossKilled)},
  {id:"ac12",name:"Handwerker",          icon:"⚗️",desc:"Ersten Gegenstand geschmiedet",         check:s=>(s._stats?.crafted||0)>=1},
  {id:"ac13",name:"Streak-König",        icon:"🔥",desc:"Streak von 7 erreicht",                 check:s=>s.character.streak>=7},
  {id:"ac14",name:"Talent-Erwecker",     icon:"🌠",desc:"3 Talente freigeschaltet",              check:s=>Object.keys(s.talents||{}).length>=3},
  {id:"ac15",name:"Aufgestiegener",      icon:"🔰",desc:"Ersten Prestige gemacht",               check:s=>(s.prestige||0)>=1},
  {id:"ac16",name:"Baumeister",          icon:"🏗️",desc:"3 Heimstatt-Gebäude errichtet",         check:s=>Object.keys(s.heimstatt?.buildings||{}).length>=3},
  {id:"ac17",name:"Gildenmeister",       icon:"⚜️",desc:"2 Gefährten angeheuert",               check:s=>Object.keys(s.guild||{}).length>=2},
  {id:"ac18",name:"Expeditionsleiter",   icon:"🗺️",desc:"3 Expeditionen abgeschlossen",         check:s=>(s._stats?.expeditions||0)>=3},
];

// ── WEATHER MAP (event effect → visual) ─────────────────────────
const WEATHER_MAP={
  "goldboost1.5":"golden","dicemod+2":"storm","dicemod-2":"fog",
  "hpfull":"nature","fateful":"starrain","xpall+20":"starfall",
  "doubleMat":"bubbles","petboost":"leaves","doubleboost:fitness":"fire",
  "none":"clear","gold+25":"golden","bossdc-3":"storm","streakshield":"clear",
};

const DUNGEONS=[
  {id:"d1",name:"Höhle der Faulheit",  icon:"🕯️",dc:10,story:"Tief in dieser Höhle schläft der Prokrastinations-Dämon. Er flüstert: 'Morgen ist auch noch ein Tag.' Bezwinge ihn — oder werde sein nächstes Opfer.",boss:{name:"Prokrastinations-Dämon",icon:"😈",hp:80,maxHp:80,atk:15,dc:10,reward:{xp:100,gold:40,rarity:"uncommon"},taunt:["Ruh dich erst noch aus...","Morgen geht das auch noch!","Du bist zu müde dafür."]}},
  {id:"d2",name:"Turm der Ablenkung",  icon:"📱",dc:13,story:"Jede Stufe dieses Turms ist ein weiterer Tab, ein weiteres Video, eine weitere Benachrichtigung. Die Hydra der Ablenkung wartet oben — und sie wächst mit jedem Scroll.",boss:{name:"Hydra der Ablenkung",icon:"🐍",hp:120,maxHp:120,atk:20,dc:13,reward:{xp:180,gold:70,rarity:"rare"},taunt:["*notification sound*","Nur NOCH ein Video...","Hast du schon deine Mails gecheckt?"]}},
  {id:"d3",name:"Palast der Zweifel",  icon:"🌑",dc:16,story:"Der innere Kritiker residiert hier. Er kennt deine schwächsten Gedanken und flüstert sie dir ins Ohr. Nur wer sich selbst glaubt, kann ihn besiegen.",boss:{name:"Stimme des Zweifels",icon:"🌑",hp:160,maxHp:160,atk:25,dc:16,reward:{xp:280,gold:100,rarity:"epic"},taunt:["Du bist nicht gut genug.","Andere machen das besser.","Wer glaubt dir das schon?"]}},
];

const HOME_BASES=[
  {lvl:1, name:"Holzhütte",   icon:"🛖",sky:"#0c0a1e",ground:"#1a2a0a",story:"Dein Abenteuer beginnt hier. Eine einfache Hütte, ein Lagerfeuer, die Sterne."},
  {lvl:5, name:"Steinhaus",   icon:"🏠",sky:"#0a1020",ground:"#1a3010",story:"Stein für Stein hast du dein Heim befestigt. Die Wände halten nun dem Sturm stand."},
  {lvl:10,name:"Turmfestung", icon:"🏰",sky:"#08082a",ground:"#0a0a1a",story:"Dein Name ist bekannt in den Dörfern ringsum. Die Festung thront über dem Land."},
  {lvl:20,name:"Magierturm",  icon:"🗼",sky:"#150a2e",ground:"#0d0522",story:"Magie durchdringt dein Reich. Der Turm reicht in Sphären, die Sterbliche nie sahen."},
  {lvl:35,name:"Drachenburg", icon:"🏯",sky:"#1a0508",ground:"#0d0205",story:"Drachen gehorchen dir. Deine Burg bricht den Horizont. Legenden sprechen deinen Namen."},
  {lvl:50,name:"Himmelspalast",icon:"✨",sky:"#0a0520",ground:"#150a30",story:"Du transzendierst das Sterbliche. Dein Palast schwebt über den Wolken. Du bist Legende."},
];

const TITLES=[
  {id:"t1",name:"Der Aufstehende",   req:lvl=>lvl>=2,  icon:"🌅"},
  {id:"t2",name:"Gewohnheitssüchtig",req:s=>s.character.streak>=5,icon:"🔥"},
  {id:"t3",name:"Kerker-Bezwinger",  req:s=>s.dungeons.some(d=>d.bossKilled),icon:"🏆"},
  {id:"t4",name:"Zoowärter",         req:s=>s.zoo.length>=3,icon:"🐾"},
  {id:"t5",name:"Ausgerüstet",       req:s=>Object.values(s.character.equipment).filter(Boolean).length>=3,icon:"⚔️"},
  {id:"t6",name:"Nat-20-Legende",    req:s=>(s.nat20Count||0)>=5,icon:"💫"},
  {id:"t7",name:"Der Reiche",        req:s=>s.character.gold>=500,icon:"🪙"},
  {id:"t8",name:"Meister",           req:s=>s.character.level>=20,icon:"👑"},
];

const TUTORIAL_PAGES=[
  {title:"Attribute",icon:"📊",lines:["6 Attribute: STR, DEX, CON, INT, WIS, CHA.","Jede Quest-Kategorie gehört zu einem Attribut.","Bonus beim Würfeln: (Attribut−10)÷2.","Items & Haustiere erhöhen Attribute dauerhaft."]},
  {title:"D20 System",icon:"🎲",lines:["Nat 1 → Fehlschlag: kein XP, kein Gold.","2–9 → Erfolg: 80% Belohnung.","10–14 → Gut: 100% + Loot-Chance.","15–19 → Groß: 150% + besserer Loot.","Nat 20 → Göttlich: 300% + hohe Loot-Chance!"]},
  {title:"Dungeons",icon:"🏰",lines:["Dungeons sind Ordner mit eigenen Quests.","Alle Quests erledigt → Miniboss erscheint.","Kämpfe mit D20 gegen den Boss.","Sieg: epischer Loot. Niederlage: Streak weg."]},
  {title:"Haustiere & Zoo",icon:"🐾",lines:["Haustiere droppen als Loot oder aus Eiern.","Nur das aktive Tier gibt seinen Bonus.","3 Evolutionsstufen mit dem Level.","Seltenheiten bis Mystisch!"]},
  {title:"Home Base",icon:"🏡",lines:["Deine Unterkunft wächst mit dir.","Level 1: Holzhütte → Level 50: Himmelspalast.","Jede Stufe erzählt eine neue Geschichte.","Vervollständige Dungeons für besondere Events."]},
  {title:"Handwerk",icon:"⚗️",lines:["Materialien droppen bei Quests (20% Chance).","3 Berufe: Alchemie, Schmieden, Schriftkunde.","Materialien auch im Marktplatz kaufen.","Talent 'Erfahrener Sammler' verdoppelt Drops."]},
  {title:"Talentbaum",icon:"🌟",lines:["Alle 5 Level → 1 Talentpunkt.","3 Zweige: Kampf, Reichtum, Handwerk.","Permanente Boni die nie verloren gehen.","Talente überleben auch Prestige!"]},
  {title:"Prestige",icon:"🔰",lines:["Ab Level 20 kannst du aufsteigen.","Level, Stats & Inventar werden zurückgesetzt.","Behalten: Zoo, Talente, 50% Gold, Erbstück.","Bis zu 6 Prestige-Stufen möglich."]},
];

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════
function getInitState(){
  return{
    setup:false,
    pointBuyLeft:27,
    baseAttrs:{STR:8,DEX:8,CON:8,INT:8,WIS:8,CHA:8},
    character:{name:"Held",level:1,xp:0,xpToNext:100,gold:30,streak:0,hp:100,maxHp:100,equippedPet:null,equipment:{weapon:null,armor:null,helmet:null,ring:null,trinket:null}},
    inventory:[],zoo:[],buffs:{},
    nat20Count:0,
    materials:{ore:0,herbs:0,magicDust:0},
    talents:{},talentPoints:0,
    prestige:0,heirlooms:[],
    expeditions:{},petAffection:{},
    shopRotation:{date:null,itemIds:[]},
    craftProf:"alchemy",
    heimstatt:{buildings:{}},
    guild:{},
    settings:{theme:"purple",size:"normal"},
    _stats:{totalQuests:0,crafted:0,expeditions:0},
    quests:[
      {id:1,title:"Morgenroutine",    cat:"habits",  xp:20,gold:5, done:false,desc:"Aufstehen & Bett machen",   dc:8,  repeat:{type:"daily",   days:[],interval:1,lastReset:null},notif:{enabled:false,time:"07:00"}},
      {id:2,title:"30 Min Sport",     cat:"fitness", xp:30,gold:8, done:false,desc:"Laufen, Training, Bewegung",dc:10, repeat:{type:"weekdays",days:[1,2,3,4,5],interval:1,lastReset:null},notif:{enabled:false,time:"08:00"}},
      {id:3,title:"Gesund essen",     cat:"health",  xp:20,gold:6, done:false,desc:"Vollwertige Mahlzeiten",    dc:8,  repeat:{type:"daily",   days:[],interval:1,lastReset:null},notif:{enabled:false,time:"12:00"}},
      {id:4,title:"30 Min Lesen",     cat:"learning",xp:25,gold:7, done:false,desc:"Buch oder Fachtext",         dc:10, repeat:{type:"daily",   days:[],interval:1,lastReset:null},notif:{enabled:false,time:"20:00"}},
      {id:5,title:"10 Min Meditieren",cat:"mindful", xp:20,gold:5, done:false,desc:"Atemübungen oder Stille",   dc:8,  repeat:{type:"daily",   days:[],interval:1,lastReset:null},notif:{enabled:false,time:"07:30"}},
      {id:6,title:"Jemanden anrufen", cat:"social",  xp:15,gold:4, done:false,desc:"Familie oder Freunde",       dc:6,  repeat:{type:"weekdays",days:[0,6],interval:1,lastReset:null},notif:{enabled:false,time:"18:00"}},
    ],
    dungeons:DUNGEONS.map(d=>({...d,quests:[],bossKilled:false,boss:{...d.boss,hp:d.boss.maxHp}})),
    log:[],
  };
}

let S=loadState();
let TAB="quests";
let MODAL=null; // {type, data}
let PB_ATTRS=null; // point buy temp