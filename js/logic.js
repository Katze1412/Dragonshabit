'use strict';
function completeQuestById(questId,dungeonId){
  const qList=dungeonId?S.dungeons.find(d=>d.id===dungeonId)?.quests:S.quests;
  const quest=qList?.find(q=>q.id==questId);
  if(!quest||quest.done)return;

  const attrs=computedAttrs();
  const attrKey=CAT_ATTR[quest.cat];
  const mod=attrMod(attrs[attrKey]||8);
  const archMod=getArchetypeDiceMod(quest.cat);
  const talentDice=S.talents?.t_dice?1:0;
  const diceMod=(S.buffs?.dicemod||0)+archMod+talentDice;
  const raw=d20();
  // Talent: 19 counts as Nat-20
  const effectiveRaw=(S.talents?.t_crit&&raw===19)?20:raw;
  const total=Math.min(effectiveRaw+mod+diceMod,20);
  const loot=getLoot(effectiveRaw===20?20:raw===1?1:total);

  // consume dicemod buff partially
  if((S.buffs?.dicemod||0)>0){S.buffs.dicemod=Math.max(0,S.buffs.dicemod-1);}

  // Determine if this is the first quest of the day (for freeitem event)
  const allDone=[...S.quests,...S.dungeons.flatMap(d=>d.quests)].filter(q=>q.done).length;
  const freeItemToday=S.buffs?.freeitem&&allDone===0;
  if(freeItemToday)delete S.buffs.freeitem;

  let item=null,pet=null;
  const talentLoot=S.talents?.t_loot?0.08:0;
  const npcLoot=getNPCBonuses()["loot+6"]?0.06:0;
  const bldLoot=getBuildingBonuses()["watchLoot+10"]?0.10:0;
  const lootChance=loot.iC+(S.buffs?.lootBoost||0)+talentLoot+npcLoot+bldLoot;
  const petChance=loot.pC+(S.buffs?.petboost?.3:0);
  if(lootChance>Math.random()||freeItemToday)item=randomItemByTier(loot.tier);
  if(petChance>Math.random())pet=randomPetByMinRarity("common");

  // Material drop: 20% chance on non-fail
  let matDropped=null;
  if(loot.tier!=="fail"&&Math.random()<0.20){
    const mk=MAT_KEYS[Math.floor(Math.random()*3)];
    const double=S.talents?.t_mat&&Math.random()<0.20;
    const amt=double?2:1;
    if(!S.materials)S.materials={ore:0,herbs:0,magicDust:0};
    S.materials[mk]=(S.materials[mk]||0)+amt;
    matDropped={key:mk,amt};
    // Building: extra magestaub
    if(getBuildingBonuses()["extraDust"]&&Math.random()<0.3){
      S.materials.magicDust=(S.materials.magicDust||0)+1;
    }
  }
  // Track total quests for achievements
  if(!S._stats)S._stats={totalQuests:0,crafted:0,expeditions:0};
  if(loot.tier!=="fail")S._stats.totalQuests=(S._stats.totalQuests||0)+1;

  // Gold multiplier from event + archetype
  const arch=getArchetype();
  const talentGold=S.talents?.t_gold?0.05:0;
  let goldM=S.buffs?.goldboost||1;
  if(arch.goldBoost)goldM+=arch.goldBoost;
  if(S.buffs?.doubleboostCat===quest.cat)goldM*=2;
  goldM+=talentGold;

  // XP multiplier from event + archetype + buildings + NPCs
  let xpM=loot.xpM;
  if(S.buffs?.xpboostCat===quest.cat)xpM*=1.5;
  if(S.buffs?.doubleboostCat===quest.cat)xpM*=2;
  if(S.buffs?.xpallBoost)xpM+=xpM*S.buffs.xpallBoost;
  if(arch.xpBoost)xpM+=xpM*arch.xpBoost;
  xpM=applyBuildingXpBonus(xpM,quest);
  if(getNPCBonuses()["xp+10"])xpM*=1.10;

  const earnedXP=Math.floor(quest.xp*xpM);
  const earnedGold=Math.floor(quest.gold*loot.goldM*goldM);

  if(raw===20)S.nat20Count=(S.nat20Count||0)+1;

  if(item)S.inventory.push({...item,uid:Date.now()});
  if(pet&&!S.zoo.find(p=>p.id===pet.id))S.zoo.push({...pet,petLevel:1});

  const newStreak=loot.tier==="fail"?(S.buffs?.streakshield?S.character.streak:0):S.character.streak+1;
  if(loot.tier==="fail"&&S.buffs?.streakshield){delete S.buffs.streakshield;float("🛡️ Streak-Schutz hat gehalten!","#22c55e");}
  S.character.streak=newStreak;
  gainXPGold(earnedXP,earnedGold);

  if(dungeonId){S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:d.quests.map(q=>q.id==questId?{...q,done:true}:q)}:d);}
  else{S.quests=S.quests.map(q=>q.id==questId?{...q,done:true}:q);}

  const storyLine=loot.story[Math.floor(Math.random()*loot.story.length)];
  addLog(`${quest.title}: ${loot.label} (${raw}) +${earnedXP}XP — "${storyLine}"`);
  saveState();

  MODAL={type:"rollresult",data:{raw,total,mod,diceMod,loot,quest,item,pet,earnedXP,earnedGold,matDropped}};
  render();
}

function buyShopItem(id){
  const item=SHOP_ITEMS.find(i=>i.id===id);
  if(!item||S.character.gold<item.cost)return;
  S.character.gold-=item.cost;
  const e=item.eff;
  if(e==="hp+30")S.character.hp=Math.min(S.character.hp+30,S.character.maxHp);
  if(e==="hp+80")S.character.hp=Math.min(S.character.hp+80,S.character.maxHp);
  if(e==="goldboost")S.buffs.goldboost=true;
  if(e==="dicemod+3")S.buffs.dicemod=(S.buffs.dicemod||0)+3;
  if(e==="streakshield")S.buffs.streakshield=true;
  if(e==="maxhp+20"){S.character.maxHp+=20;S.character.hp+=20;}
  if(e==="xp+50")gainXPGold(50,0);
  if(e==="attr:STR+1")S.baseAttrs.STR++;
  if(e==="attr:INT+1")S.baseAttrs.INT++;
  if(e==="attr:WIS+1")S.baseAttrs.WIS++;
  if(e.startsWith("loot:")){const t=e.split(":")[1];const ni=randomItemByTier(t);if(ni)S.inventory.push({...ni,uid:Date.now()});}
  if(e.startsWith("pet:")){const minR=e.split(":")[1];const np=randomPetByMinRarity(minR);if(np&&!S.zoo.find(p=>p.id===np.id))S.zoo.push({...np,petLevel:1});}
  addLog(`🛒 Gekauft: ${item.name}`);
  saveState();
  float(`🛒 ${item.name}`,"#fbbf24");
  render();
}

function canEquipItem(item){
  const attrs=computedAttrs();
  if(!item.req)return{ok:true};
  const failed=Object.entries(item.req).filter(([attr,needed])=>(attrs[attr]||0)<needed);
  if(failed.length){
    const needStr=failed.map(([a,v])=>a+" "+v).join(", ");
    const haveStr=failed.map(([a])=>attrs[a]||0).join(", ");
    return{ok:false,reason:"Benötigt: "+needStr+" (du hast: "+haveStr+")"};
  }
  return{ok:true};
}

function getEquipRequirementText(item){
  if(!item.req&&!item.archReq)return null;
  const parts=[];
  if(item.req)parts.push(Object.entries(item.req).map(([a,v])=>`${a} ≥ ${v}`).join(" & "));
  if(item.archReq)parts.push(`Klasse: ${item.archReq.slice(0,3).join(" / ")}${item.archReq.length>3?"…":""}`);
  return parts.join(" · ");
}

function equipItem(uid){
  const item=S.inventory.find(i=>i.uid==uid);
  if(!item)return;
  const check=canEquipItem(item);
  if(!check.ok){float(`❌ ${check.reason}`,"#ef4444");return;}
  // Archetype soft-warning (not a hard block, just info)
  const arch=getArchetype();
  if(item.archReq&&!item.archReq.includes(arch.name)){
    // Show a warning but allow equip — soft restriction
    float(`⚠️ Empfohlen für: ${item.archReq[0]}. Du kannst es trotzdem tragen.`,"#f59e0b");
  }
  S.character.equipment={...S.character.equipment,[item.slot]:{...item}};
  float(`${item.icon} ${item.name} ausgerüstet!`,RARITIES[item.rarity].color);
  addLog(`⚔️ Ausgerüstet: ${item.name}`);
  saveState();render();
}

function equipPet(petId){
  S.character.equippedPet=petId;
  const p=PETS.find(x=>x.id===petId);
  if(p)float(`${p.icon} ${p.name} begleitet dich!`,RARITIES[p.rarity].color);
  saveState();render();
}

function addNewQuest(title,cat,dc,dungeonId){
  if(!title.trim())return;
  const q={id:Date.now(),title:title.trim(),cat,xp:20,gold:7,done:false,desc:"Eigene Quest",dc:parseInt(dc)||10,
    repeat:{type:"daily",days:[],interval:1,lastReset:null},
    notif:{enabled:false,time:"09:00"}};
  if(dungeonId){S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:[...d.quests,q]}:d);}
  else S.quests.push(q);
  saveState();render();
}

// ── REPEAT HELPERS ───────────────────────────────────────────────
const DAYS_DE=["So","Mo","Di","Mi","Do","Fr","Sa"];

function questShouldResetToday(q){
  if(!q.repeat)return true; // legacy quests → always reset
  const r=q.repeat;
  if(r.type==="manual")return false;
  if(r.type==="daily")return true;
  const dow=new Date().getDay(); // 0=Sun
  if(r.type==="weekdays")return(r.days||[]).includes(dow);
  if(r.type==="interval"){
    if(!r.lastReset)return true;
    const daysSince=Math.floor((Date.now()-new Date(r.lastReset).getTime())/86400000);
    return daysSince>=(r.interval||1);
  }
  return true;
}

function questIsActiveToday(q){
  if(!q.repeat)return true;
  const r=q.repeat;
  if(r.type==="manual"||r.type==="daily")return true;
  const dow=new Date().getDay();
  if(r.type==="weekdays")return(r.days||[]).length===0||(r.days||[]).includes(dow);
  if(r.type==="interval")return questShouldResetToday(q)||!q.done;
  return true;
}

function repeatLabel(q){
  if(!q.repeat||q.repeat.type==="daily")return"täglich";
  const r=q.repeat;
  if(r.type==="manual")return"manuell";
  if(r.type==="interval")return`alle ${r.interval}d`;
  if(r.type==="weekdays"){
    if(!r.days?.length)return"täglich";
    return(r.days||[]).map(d=>DAYS_DE[d]).join(", ");
  }
  return"täglich";
}

function updateQuestRepeat(id,repeat,notif,dungeonId){
  const patch=q=>q.id==id?{...q,repeat,notif}:q;
  if(dungeonId)S.dungeons=S.dungeons.map(d=>d.id===dungeonId?{...d,quests:d.quests.map(patch)}:d);
  else S.quests=S.quests.map(patch);
  scheduleQuestNotifications();
  saveState();render();
}

function resetDay(){
  const today=new Date().toDateString();
  S.quests=S.quests.map(q=>{
    if(!questShouldResetToday(q))return q;
    const repeat=q.repeat?{...q.repeat,lastReset:today}:q.repeat;
    return{...q,done:false,repeat};
  });
  S.buffs={};S.character.streak=0;
  const bb=getBuildingBonuses();
  if(bb["dailyGold+15"]){S.character.gold+=15;setTimeout(()=>float("🏦 +15🪙 Schatzkammer","#fbbf24"),600);}
  if(bb["dailyHp+20"]){S.character.hp=Math.min(S.character.hp+20,S.character.maxHp);setTimeout(()=>float("🍺 +20 HP Gasthaus","#22c55e"),900);}
  const ev=rollDailyEvent();
  addLog(`🌙 Neuer Tag · Ereignis: ${ev.title}`);
  saveState();MODAL={type:"dailyEvent",data:{ev}};render();
}

// Point buy
const PB_COSTS={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
function pbSpend(attr,dir){
  if(!PB_ATTRS)return;
  const cur=PB_ATTRS[attr];const next=cur+dir;
  if(next<8||next>15)return;
  const cost=dir>0?(PB_COSTS[next]-PB_COSTS[cur]):-(PB_COSTS[cur]-PB_COSTS[next]);
  const rem=pbRemaining();
  if(rem-cost<0)return;
  PB_ATTRS[attr]=next;
  render();
}
function pbRemaining(){
  if(!PB_ATTRS)return 27;
  return 27-Object.entries(PB_ATTRS).reduce((sum,[k,v])=>sum+(PB_COSTS[v]||0),0);
}

function finishSetup(){
  const nameEl=document.getElementById("pb-name");
  const name=(nameEl?.value||"").trim()||"Held";
  S.baseAttrs={...PB_ATTRS};
  S.character.name=name;
  S.character.hp=S.character.maxHp;
  S.setup=true;
  addLog(`⚔️ ${name} betritt die Welt!`);
  saveState();render();
}
window.finishSetup=finishSetup;
let BOSS_STATE=null;
function startBoss(dungeonId){
  const dng=S.dungeons.find(d=>d.id===dungeonId);
  if(!dng||dng.bossKilled)return;
  BOSS_STATE={dungeonId,bossHp:dng.boss.maxHp,playerHp:S.character.hp,log:[],phase:"idle",lastRoll:null,rolling:false};
  MODAL={type:"boss",data:{dungeonId}};
  render();
}

function bossDieRoll(){
  if(!BOSS_STATE||BOSS_STATE.rolling||BOSS_STATE.phase!=="idle")return;
  BOSS_STATE.rolling=true;
  BOSS_STATE.lastRoll=null;
  let t=0;
  const interval=setInterval(()=>{
    t++;
    document.getElementById("boss-die")&&(document.getElementById("boss-die").textContent=d20());
    if(t>14){
      clearInterval(interval);
      const raw=d20();
      const attrs=computedAttrs();
      const totalMod=Object.values(attrs).reduce((s,v)=>s+Math.max(0,attrMod(v)),0);
      const dng=S.dungeons.find(d=>d.id===BOSS_STATE.dungeonId);
      const boss=dng.boss;
      const total=Math.min(raw+Math.floor(totalMod/3),20);
      BOSS_STATE.lastRoll={raw,total,isCrit:raw===20,isFail:raw===1,success:raw===20||(total>=boss.dc)};
      BOSS_STATE.rolling=false;
      if(document.getElementById("boss-die"))document.getElementById("boss-die").textContent=raw;
      renderBossActions();
    }
  },60);
}

function bossAttack(){
  if(!BOSS_STATE||!BOSS_STATE.lastRoll)return;
  const dng=S.dungeons.find(d=>d.id===BOSS_STATE.dungeonId);
  const boss=dng.boss;
  const {raw,total,isCrit,isFail,success}=BOSS_STATE.lastRoll;
  BOSS_STATE.lastRoll=null;

  const playerAtk=8+Math.floor(S.character.level*1.5);
  const dmg=isCrit?playerAtk*2:success?playerAtk:Math.floor(playerAtk*.25);
  BOSS_STATE.bossHp=Math.max(0,BOSS_STATE.bossHp-dmg);
  BOSS_STATE.log.unshift(isCrit?`⚡ KRIT! Du: ${dmg} Schaden!`:success?`⚔️ Treffer! ${dmg} Schaden`:`💨 Fehlschlag... ${dmg} Schaden`);

  if(BOSS_STATE.bossHp<=0){
    BOSS_STATE.phase="victory";
    addLog(`🏆 Boss besiegt: ${boss.name}!`);
    renderBossScreen();return;
  }

  BOSS_STATE.phase="bossAttack";
  renderBossScreen();
  setTimeout(()=>{
    const bDmg=isFail?boss.atk*2:success?Math.floor(boss.atk*.4):boss.atk;
    BOSS_STATE.playerHp=Math.max(0,BOSS_STATE.playerHp-bDmg);
    const taunt=boss.taunt[Math.floor(Math.random()*boss.taunt.length)];
    BOSS_STATE.log.unshift(`${boss.icon} "${taunt}" — ${bDmg} Schaden!`);
    if(BOSS_STATE.playerHp<=0){BOSS_STATE.phase="defeat";addLog(`💀 Niederlage gegen ${boss.name}.`);}
    else BOSS_STATE.phase="idle";
    renderBossScreen();
  },900);
}

function bossVictory(){
  const dng=S.dungeons.find(d=>d.id===BOSS_STATE.dungeonId);
  const r=dng.boss.reward;
  const lootItem=randomItemByTier("great");
  if(lootItem)S.inventory.push({...lootItem,uid:Date.now()});
  gainXPGold(r.xp,r.gold);
  S.dungeons=S.dungeons.map(d=>d.id===BOSS_STATE.dungeonId?{...d,bossKilled:true}:d);
  float(`🏆 BOSS BESIEGT! +${r.xp}XP`,"#fbbf24");
  BOSS_STATE=null;MODAL=null;saveState();render();
}

function bossDefeat(){
  if(S.buffs?.streakshield){delete S.buffs.streakshield;float("🛡️ Streak-Schutz aktiviert!","#22c55e");}
  else S.character.streak=0;
  BOSS_STATE=null;MODAL=null;saveState();render();
}

// ═══════════════════════════════════════════════════════════════
// NEW SYSTEM LOGIC
// ═══════════════════════════════════════════════════════════════

// ── CRAFTING ─────────────────────────────────────────────────────
function craft(recipeId){
  const r=CRAFTING_RECIPES.find(x=>x.id===recipeId);if(!r)return;
  if(!S.materials)S.materials={ore:0,herbs:0,magicDust:0};
  const disc=S.talents?.t_craft?1:0;
  for(const[mat,need]of Object.entries(r.cost)){
    if((S.materials[mat]||0)<Math.max(1,need-disc)){float(`❌ Zu wenig ${MATERIALS[mat].name}!`,"#ef4444");return;}
  }
  for(const[mat,need]of Object.entries(r.cost))S.materials[mat]-=Math.max(1,need-disc);
  const e=r.eff;
  if(e==="hp+60")S.character.hp=Math.min(S.character.hp+60,S.character.maxHp);
  if(e==="dicemod+3")S.buffs.dicemod=(S.buffs.dicemod||0)+3;
  if(e==="goldboost")S.buffs.goldboost=2;
  if(e==="xp+80")gainXPGold(80,0);
  if(e==="dicemod+5")S.buffs.dicemod=(S.buffs.dicemod||0)+5;
  if(e==="attr:rnd+1"){const a=["STR","DEX","CON","INT","WIS","CHA"],k=a[Math.floor(Math.random()*6)];S.baseAttrs[k]++;float(`✨ ${k} +1!`,"#a78bfa");}
  if(e.startsWith("item:")){const ci=CRAFTED_ITEMS[e.split(":")[1]];if(ci)S.inventory.push({...ci,uid:Date.now()});}
  if(!S._stats)S._stats={totalQuests:0,crafted:0,expeditions:0};
  S._stats.crafted=(S._stats.crafted||0)+1;
  addLog(`⚗️ Gefertigt: ${r.name}`);float(`⚗️ ${r.name} fertig!`,"#a78bfa");saveState();render();
}

// ── ROTATING SHOP ─────────────────────────────────────────────────
function getRotatingShopItems(){
  const today=new Date().toDateString();
  if(S.shopRotation?.date!==today){
    // Deterministischer Seed aus dem Datum
    const dn=new Date().getDate()*31+new Date().getMonth()*7+new Date().getFullYear();
    const pick=(pool)=>{
      const s=[...pool].sort((a,b)=>((dn*7+a.id.charCodeAt(1)*13)%97)-((dn*7+b.id.charCodeAt(1)*13)%97));
      return s[0];
    };
    // Slot 1: immer Common
    const common=pick(ITEMS.filter(i=>i.rarity==="common"));
    // Slot 2: immer Uncommon
    const uncommon=pick(ITEMS.filter(i=>i.rarity==="uncommon"));
    // Slot 3: ~25% Epic, ~40% Rare, sonst Uncommon — per seed-basiertem Zufall
    const roll=(dn*13+7)%100;
    let slot3Pool;
    if(roll<25)      slot3Pool=ITEMS.filter(i=>["epic","legendary"].includes(i.rarity));
    else if(roll<65) slot3Pool=ITEMS.filter(i=>i.rarity==="rare");
    else             slot3Pool=ITEMS.filter(i=>i.rarity==="uncommon"&&i.id!==uncommon?.id);
    const third=pick(slot3Pool)||pick(ITEMS.filter(i=>i.rarity==="rare"));
    S.shopRotation={date:today,itemIds:[common,uncommon,third].filter(Boolean).map(i=>i.id)};
    saveState();
  }
  return(S.shopRotation.itemIds||[]).map(id=>ITEMS.find(i=>i.id===id)).filter(Boolean);
}
function buyRotatingItem(itemId){
  const item=ITEMS.find(i=>i.id===itemId);if(!item)return;
  const price=RARITY_SHOP_PRICES[item.rarity]||100;
  if(S.character.gold<price){float("❌ Zu wenig Gold!","#ef4444");return;}
  S.character.gold-=price;S.inventory.push({...item,uid:Date.now()});
  addLog(`🏪 Gekauft: ${item.name}`);float(`${item.icon} ${item.name}`,RARITIES[item.rarity].color);saveState();render();
}
function buyMatPack(packId){
  const p=SHOP_MAT_PACKS.find(x=>x.id===packId);if(!p||S.character.gold<p.cost){float("❌ Zu wenig Gold!","#ef4444");return;}
  S.character.gold-=p.cost;if(!S.materials)S.materials={ore:0,herbs:0,magicDust:0};
  if(p.eff==="mat:ore:3")S.materials.ore+=3;
  if(p.eff==="mat:herbs:3")S.materials.herbs+=3;
  if(p.eff==="mat:magicDust:3")S.materials.magicDust+=3;
  if(p.eff==="mat:mixed"){S.materials.ore+=2;S.materials.herbs+=2;S.materials.magicDust+=1;}
  addLog(`📦 ${p.name}`);float(`📦 ${p.name}`,"#fbbf24");saveState();render();
}

// ── EXPEDITIONS ───────────────────────────────────────────────────
function getExpStatus(petId){
  const e=S.expeditions?.[petId];if(!e)return null;
  const rem=e.endTime-Date.now();return{...e,done:rem<=0,remaining:Math.max(0,rem)};
}
function sendExpedition(petId,hours){
  if(!S.expeditions)S.expeditions={};
  if(S.expeditions[petId]){float("🗺️ Bereits unterwegs!","#6b7280");return;}
  S.expeditions[petId]={endTime:Date.now()+hours*3600000,hours};
  const p=PETS.find(x=>x.id===petId);
  addLog(`🗺️ ${p?.name||petId} auf ${hours}h-Expedition`);
  float(`🗺️ ${p?.icon||"🐾"} Unterwegs (${hours}h)`,"#14b8a6");saveState();render();
}
function collectExpedition(petId){
  const e=S.expeditions?.[petId];if(!e||Date.now()<e.endTime){float("⏱️ Noch nicht zurück!","#6b7280");return;}
  const def=PETS.find(p=>p.id===petId);
  const affLvl=(S.petAffection?.[petId]?.level)||0;
  const mult=(1+affLvl*0.05)*(S.talents?.t_exp?1.25:1)*({common:1,uncommon:1.2,rare:1.5,epic:2,legendary:2.5,mystic:3}[def?.rarity||"common"]||1);
  const base={4:[5,15],8:[15,30],12:[30,60]}[e.hours]||[5,15];
  const gold=Math.floor((base[0]+Math.random()*(base[1]-base[0]))*mult);
  S.character.gold+=gold;
  const mats=[];
  for(let i=0;i<Math.floor(e.hours/4);i++){
    if(Math.random()<({4:.4,8:.6,12:.8}[e.hours]||.4)){
      const k=MAT_KEYS[Math.floor(Math.random()*3)];
      if(!S.materials)S.materials={ore:0,herbs:0,magicDust:0};
      S.materials[k]=(S.materials[k]||0)+1;mats.push(MATERIALS[k].icon);
    }
  }
  // NPC Späher bonus material
  if(getNPCBonuses()["expBonus"]){
    const k=MAT_KEYS[Math.floor(Math.random()*3)];
    S.materials[k]=(S.materials[k]||0)+1;mats.push(MATERIALS[k].icon);
  }
  delete S.expeditions[petId];
  if(!S._stats)S._stats={totalQuests:0,crafted:0,expeditions:0};
  S._stats.expeditions=(S._stats.expeditions||0)+1;
  addLog(`🗺️ ${def?.name||petId} zurück! +${gold}🪙 ${mats.join("")}`);
  float(`🗺️ ${def?.icon||"🐾"} +${gold}🪙 ${mats.join("")}`,"#14b8a6");saveState();render();
}
function petInteract(petId){
  if(!S.petAffection)S.petAffection={};
  if(!S.petAffection[petId])S.petAffection[petId]={level:0,lastDate:null};
  const today=new Date().toDateString();
  if(S.petAffection[petId].lastDate===today){float("💔 Bereits heute!","#6b7280");return;}
  S.petAffection[petId].lastDate=today;
  if(S.petAffection[petId].level<5)S.petAffection[petId].level++;
  const p=PETS.find(x=>x.id===petId);
  float(`${p?.icon||"🐾"} Zuneigung ❤️ Lv ${S.petAffection[petId].level}`,"#f9a8d4");
  saveState();render();
}

// ── TALENTS ───────────────────────────────────────────────────────
function buyTalent(id){
  const t=TALENT_TREE.find(x=>x.id===id);if(!t)return;
  if(S.talents?.[id]){float("Bereits aktiv!","#6b7280");return;}
  if((S.talentPoints||0)<t.cost){float("❌ Kein Talentpunkt!","#ef4444");return;}
  S.talents[id]=true;S.talentPoints-=t.cost;
  if(id==="t_hp"){S.character.maxHp+=20;S.character.hp=Math.min(S.character.hp+20,S.character.maxHp);S._hpTalentApplied=true;}
  addLog(`🌟 Talent: ${t.name}`);float(`🌟 ${t.name} aktiv!`,t.color);saveState();render();
}

// ── PRESTIGE ──────────────────────────────────────────────────────
function doPrestige(){
  if(S.character.level<20){float("❌ Level 20 erforderlich!","#ef4444");return;}
  const pc=(S.prestige||0)+1;
  const hItem={...PRESTIGE_HEIRLOOMS[Math.min(pc-1,PRESTIGE_HEIRLOOMS.length-1)],uid:Date.now()};
  const keptGold=Math.floor(S.character.gold*0.5);
  const keptMats={ore:Math.floor((S.materials?.ore||0)*0.3),herbs:Math.floor((S.materials?.herbs||0)*0.3),magicDust:Math.floor((S.materials?.magicDust||0)*0.3)};
  const newHeirlooms=[...(S.heirlooms||[]),hItem];
  const name=S.character.name,zoo=[...S.zoo],talents={...S.talents},talPts=S.talentPoints||0,affection={...(S.petAffection||{})},nat20=S.nat20Count||0;
  S={...getInitState(),setup:true,starterGenDone:true,
    character:{name,level:1,xp:0,xpToNext:100,gold:keptGold,streak:0,hp:100,maxHp:100,equippedPet:null,equipment:{weapon:null,armor:null,helmet:null,ring:null,trinket:null}},
    inventory:[...newHeirlooms],zoo,buffs:{},nat20Count:nat20,
    materials:keptMats,talents,talentPoints:talPts,prestige:pc,heirlooms:newHeirlooms,
    expeditions:{},petAffection:affection,shopRotation:{date:null,itemIds:[]},craftProf:"alchemy",
    quests:S.quests.map(q=>({...q,done:false})),dungeons:DUNGEONS.map(d=>({...d,quests:[],bossKilled:false,boss:{...d.boss,hp:d.boss.maxHp}})),log:[],
  };
  if(S.talents.t_hp){S.character.maxHp+=20;S._hpTalentApplied=true;}
  newHeirlooms.forEach(h=>{if(!S.character.equipment[h.slot])S.character.equipment[h.slot]=h;});
  addLog(`🔰 Prestige #${pc}! Erbstück: ${hItem.name}`);
  saveState();MODAL={type:"prestige",data:{pc,hItem}};render();
}

// ═══════════════════════════════════════════════════════════════
// HEIMSTATT & GUILD LOGIC
// ═══════════════════════════════════════════════════════════════

function getBuildingBonuses(){
  const b={};
  Object.keys(S.heimstatt?.buildings||{}).forEach(id=>{
    const bld=HEIMSTATT_BUILDINGS.find(x=>x.id===id);
    if(bld)b[bld.effect]=true;
  });
  return b;
}
function hasBuildingReq(bld){
  return !bld.req||S.heimstatt?.buildings?.[bld.req];
}
function buyBuilding(id){
  const bld=HEIMSTATT_BUILDINGS.find(b=>b.id===id);if(!bld)return;
  if(S.heimstatt?.buildings?.[id]){float("Bereits erbaut!","#6b7280");return;}
  if(!hasBuildingReq(bld)){float("❌ Voraussetzung fehlt!","#ef4444");return;}
  if(S.character.gold<bld.cost){float("❌ Zu wenig Gold!","#ef4444");return;}
  S.character.gold-=bld.cost;
  if(!S.heimstatt)S.heimstatt={buildings:{}};
  S.heimstatt.buildings[id]=true;
  // Immediate effects
  if(bld.effect==="dailyGold+15")S.character.gold+=15;
  if(bld.effect==="dailyHp+20")S.character.hp=Math.min(S.character.hp+20,S.character.maxHp);
  addLog(`🏗️ Gebaut: ${bld.name}`);float(`🏗️ ${bld.name} errichtet!`,bld.color);
  saveState();render();
}

function getNPCBonuses(){
  const b={};
  Object.keys(S.guild||{}).forEach(id=>{const n=NPCS.find(x=>x.id===id);if(n)b[n.effect]=true;});
  return b;
}
function hireNPC(id){
  const n=NPCS.find(x=>x.id===id);if(!n)return;
  if(S.guild?.[id]){float("Bereits angeheuert!","#6b7280");return;}
  if(S.character.gold<n.hire){float("❌ Zu wenig Gold!","#ef4444");return;}
  S.character.gold-=n.hire;
  if(!S.guild)S.guild={};
  S.guild[id]=true;
  if(!S._lastWeeklyPay)S._lastWeeklyPay=Date.now();
  addLog(`⚜️ Angeheuert: ${n.name}`);float(`⚜️ ${n.name} tritt bei!`,n.color);
  saveState();render();
}
function fireNPC(id){
  const n=NPCS.find(x=>x.id===id);if(!n)return;
  delete S.guild[id];
  addLog(`👋 Entlassen: ${n.name}`);float(`👋 ${n.name} entlassen.`,"#6b7280");
  saveState();render();
}

// Apply building XP bonuses in quest completion
function applyBuildingXpBonus(xpM, quest){
  const bb=getBuildingBonuses();
  if(quest.cat==="learning"&&bb["intXp+15"])xpM*=1.15;
  if(quest.cat==="fitness"&&bb["strXp+15"])xpM*=1.15;
  if((quest.cat==="mindful"||quest.cat==="health")&&bb["wisXp+15"])xpM*=1.15;
  return xpM;
}

// ─── DATA CRYSTAL (Save Export / Import) ────────────────────────
function exportSave(){
  const data=JSON.stringify(S,null,0);
  const blob=new Blob([data],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`bufflife-save-${S.character.name}-lv${S.character.level}.json`;
  a.click();URL.revokeObjectURL(a.href);
  float("💎 Spielstand exportiert!","#6366f1");
}
function importSave(){
  const inp=document.createElement("input");
  inp.type="file";inp.accept=".json";
  inp.onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    const r=new FileReader();
    r.onload=ev=>{
      try{
        const data=JSON.parse(ev.target.result);
        if(!data.character||!data.setup)throw new Error("Ungültig");
        S=data;migrateState();saveState();
        float("💎 Spielstand geladen!","#22c55e");render();
      }catch{float("❌ Ungültige Datei!","#ef4444");}
    };r.readAsText(f);
  };inp.click();
}
function deleteSave(){
  localStorage.removeItem("rpg-v5");
  S=getInitState();PB_ATTRS={...S.baseAttrs};MODAL=null;TAB="quests";
  float("🗑️ Spielstand gelöscht.","#ef4444");render();
}

// ═══════════════════════════════════════════════════════════════
// FLOAT NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════