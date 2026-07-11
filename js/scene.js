'use strict';
function float(text,color="#a78bfa"){
  const div=document.createElement("div");
  div.className="float-item";
  div.style.color=color;div.style.borderColor=color;
  div.textContent=text;
  document.getElementById("floats").appendChild(div);
  setTimeout(()=>div.remove(),2100);
}

// ═══════════════════════════════════════════════════════════════
// HOME BASE SCENE BUILDER
// ═══════════════════════════════════════════════════════════════
function buildWeatherOverlay(){
  const ev=S.dailyEvent;if(!ev)return"";
  const wType=WEATHER_MAP[ev.effect]||"clear";
  if(wType==="clear")return"";
  let h=`<div class="wx-overlay">`;
  if(wType==="golden"){
    for(let i=0;i<5;i++){const x=10+i*18,d=i*.4;h+=`<div style="position:absolute;top:0;left:${x}%;width:3px;height:100%;background:linear-gradient(180deg,transparent,#fbbf2444,transparent);animation:goldRay ${1.5+d}s ${d}s infinite alternate"></div>`;}
    h+=`<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 60% 20%,#fbbf2422,transparent 60%)"></div>`;
  }
  if(wType==="storm"){
    for(let i=0;i<18;i++){const x=Math.random()*100,d=Math.random()*1.5,dur=0.4+Math.random()*0.4;h+=`<div style="position:absolute;left:${x}%;top:-4px;width:1px;height:14px;background:rgba(99,102,241,.7);animation:rainDrop ${dur}s ${d}s infinite linear"></div>`;}
    h+=`<div style="position:absolute;inset:0;animation:lightningFlash 4s 2s infinite;background:#6366f122"></div>`;
  }
  if(wType==="fog"){
    for(let i=0;i<22;i++){const x=Math.random()*100,d=Math.random()*2,dur=0.5+Math.random()*0.5;h+=`<div style="position:absolute;left:${x}%;top:-4px;width:1px;height:12px;background:rgba(100,100,120,.5);animation:rainDrop ${dur}s ${d}s infinite linear"></div>`;}
    h+=`<div style="position:absolute;inset:0;background:rgba(20,20,40,.35);animation:fogDrift 8s infinite alternate"></div>`;
  }
  if(wType==="nature"){
    for(let i=0;i<8;i++){const x=Math.random()*100,d=Math.random()*2,dur=1.5+Math.random();h+=`<div style="position:absolute;left:${x}%;top:-5px;font-size:8px;animation:leafDrift ${dur}s ${d}s infinite linear">🍃</div>`;}
    h+=`<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 100%,#22c55e18,transparent 70%)"></div>`;
  }
  if(wType==="starrain"||wType==="starfall"){
    for(let i=0;i<12;i++){const x=Math.random()*100,d=Math.random()*2,dur=0.8+Math.random()*0.8;h+=`<div style="position:absolute;left:${x}%;top:-4px;width:1px;height:${wType==="starfall"?18:8}px;background:linear-gradient(180deg,#f9a8d4,transparent);animation:starFall ${dur}s ${d}s infinite linear"></div>`;}
  }
  if(wType==="bubbles"){
    for(let i=0;i<8;i++){const x=10+i*12,d=Math.random()*2,s=4+Math.random()*6;h+=`<div style="position:absolute;bottom:0;left:${x}%;width:${s}px;height:${s}px;border-radius:50%;border:1px solid #a78bfa88;animation:bubble ${1+d}s ${d}s infinite linear"></div>`;}
  }
  if(wType==="leaves"){
    for(let i=0;i<6;i++){const x=Math.random()*100,d=Math.random()*2;h+=`<div style="position:absolute;left:${x}%;top:-5px;font-size:10px;animation:leafDrift ${1.5+d}s ${d}s infinite linear">🍂</div>`;}
  }
  if(wType==="fire"){
    for(let i=0;i<5;i++){const x=10+i*18,d=i*.2;h+=`<div style="position:absolute;bottom:4px;left:${x}%;font-size:10px;animation:flicker .4s ${d}s infinite alternate">🔥</div>`;}
  }
  h+=`</div>`;return h;
}

function buildScene(){
  const hb=getHomeBase();
  const lv=S.character.level;
  let html=`<div class="home-scene" id="home-scene" style="cursor:pointer">`;

  if(lv<5){
    // Holzhütte: sternenhimmel, lagerfeuer, hütte
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#050310 0%,#0c0a1e 60%,#1a2a0a 100%)">`;
    for(let i=0;i<18;i++){
      const x=Math.random()*100,y=Math.random()*60,s=Math.random()*2+1,d=Math.random()*3;
      html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></div>`;
    }
    html+=`<div style="position:absolute;bottom:0;left:0;right:0;height:50px;background:#1a2a0a;border-radius:40% 60% 0 0/20px 20px 0 0"></div>`;
    // Hütte
    html+=`<div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%)">
      <div style="width:0;height:0;border-left:30px solid transparent;border-right:30px solid transparent;border-bottom:25px solid #5c3d1e;margin:0 auto"></div>
      <div style="width:50px;height:25px;background:#3d2a10;margin:0 auto"></div>
      <div style="width:12px;height:14px;background:#1a1008;position:absolute;bottom:0;left:50%;transform:translateX(-50%)"></div>
    </div>`;
    // Lagerfeuer
    html+=`<div style="position:absolute;bottom:32px;right:25%">
      <div style="font-size:14px;animation:flicker .6s infinite alternate">🔥</div>
    </div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  } else if(lv<10){
    // Steinhaus: hügel, haus mit schornstein
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#080c20 0%,#0f1830 60%,#0a1f0a 100%)">`;
    for(let i=0;i<10;i++){const x=Math.random()*100,y=Math.random()*50,s=Math.random()*1.5+.5,d=Math.random()*3;html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></div>`;}
    html+=`<div style="position:absolute;bottom:0;left:0;right:0;height:45px;background:linear-gradient(180deg,#103010,#0a1a0a);border-radius:60% 40% 0 0/15px 15px 0 0"></div>`;
    html+=`<div style="position:absolute;bottom:0;left:0;right:0;height:30px;background:#0a1a0a"></div>`;
    // Haus
    html+=`<div style="position:absolute;bottom:28px;left:50%;transform:translateX(-50%)">
      <div style="width:0;height:0;border-left:35px solid transparent;border-right:35px solid transparent;border-bottom:28px solid #444;margin:0 auto"></div>
      <div style="width:60px;height:32px;background:#555;margin:0 auto;border:2px solid #333"></div>
      <div style="width:14px;height:16px;background:#222;position:absolute;bottom:0;left:23px"></div>
      <div style="width:8px;height:18px;background:#3a3a3a;position:absolute;top:-38px;right:10px"></div>
    </div>`;
    html+=`<div style="position:absolute;top:8px;right:37%;font-size:12px;animation:smoke 2s infinite;opacity:.6">💨</div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  } else if(lv<20){
    // Turmfestung
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#040420 0%,#080840 60%,#0a0a1a 100%)">`;
    for(let i=0;i<12;i++){const x=Math.random()*100,y=Math.random()*55,s=Math.random()*2+.5,d=Math.random()*3;html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></div>`;}
    html+=`<div style="position:absolute;bottom:0;width:100%;height:30px;background:#0a0a1a"></div>`;
    // Turm
    html+=`<div style="position:absolute;bottom:28px;left:50%;transform:translateX(-50%)">
      <div style="display:flex;gap:2px;margin-bottom:0">
        ${Array(5).fill('<div style="width:8px;height:10px;background:#333;border-top:2px solid #555"></div>').join("")}
      </div>
      <div style="width:48px;height:60px;background:#2a2a3a;border:2px solid #444;margin:0 auto"></div>
      <div style="width:16px;height:18px;background:#111;position:absolute;bottom:0;left:16px"></div>
    </div>`;
    // Fackeln
    html+=`<div style="position:absolute;bottom:88px;left:34%;font-size:12px;animation:flicker .5s infinite alternate">🔥</div>`;
    html+=`<div style="position:absolute;bottom:88px;right:32%;font-size:12px;animation:flicker .7s infinite alternate">🔥</div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  } else if(lv<35){
    // Magierturm
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#0e0520 0%,#1a0840 60%,#0d0520 100%)">`;
    for(let i=0;i<20;i++){const x=Math.random()*100,y=Math.random()*70,s=Math.random()*2+.5,d=Math.random()*4;html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></div>`;}
    html+=`<div style="position:absolute;top:15px;right:15%;font-size:22px;opacity:.7;animation:float 4s infinite">🌙</div>`;
    // Magische orbs
    for(let i=0;i<5;i++){const x=10+Math.random()*80,d=Math.random()*3;html+=`<div style="position:absolute;top:${20+Math.random()*40}%;left:${x}%;width:4px;height:4px;border-radius:50%;background:#a78bfa;animation:float ${2+d}s infinite;box-shadow:0 0 6px #7c3aed"></div>`;}
    html+=`<div style="position:absolute;bottom:0;width:100%;height:25px;background:#0d0520"></div>`;
    // Hoher turm mit spitze
    html+=`<div style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);text-align:center">
      <div style="width:0;height:0;border-left:12px solid transparent;border-right:12px solid transparent;border-bottom:22px solid #4c1d95;margin:0 auto"></div>
      <div style="width:30px;height:70px;background:linear-gradient(180deg,#2d1b6e,#1e1b4b);margin:0 auto;border:1px solid #4f46e5;box-shadow:0 0 12px #7c3aed44"></div>
      <div style="width:16px;height:18px;background:#0d0b1e;position:absolute;bottom:0;left:7px;border:1px solid #4f46e5"></div>
    </div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  } else if(lv<50){
    // Drachenburg
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#100004 0%,#250508 60%,#1a0204 100%)">`;
    for(let i=0;i<8;i++){const x=Math.random()*100,y=Math.random()*60,s=Math.random()*2+.5,d=Math.random()*3;html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s;background:#ff6644"></div>`;}
    html+=`<div style="position:absolute;top:10px;left:15%;font-size:20px;animation:float 3s infinite">🐲</div>`;
    html+=`<div style="position:absolute;bottom:0;width:100%;height:25px;background:#1a0204"></div>`;
    // Burg
    html+=`<div style="position:absolute;bottom:23px;left:50%;transform:translateX(-50%);display:flex;gap:2px;align-items:flex-end">
      <div style="width:20px;height:45px;background:#2a0808;border:1px solid #5a1010"></div>
      <div>
        <div style="display:flex;gap:1px;margin-bottom:0">${Array(4).fill('<div style="width:8px;height:8px;background:#3a1010;border-top:1px solid #5a2020"></div>').join("")}</div>
        <div style="width:40px;height:55px;background:#2a0808;border:2px solid #5a1010"></div>
        <div style="width:14px;height:16px;background:#1a0404;position:absolute;bottom:0;left:13px"></div>
      </div>
      <div style="width:20px;height:45px;background:#2a0808;border:1px solid #5a1010"></div>
    </div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  } else {
    // Himmelspalast
    html+=`<div class="scene-sky" style="background:linear-gradient(180deg,#050520 0%,#0a0535 50%,#150a30 100%)">`;
    for(let i=0;i<25;i++){const x=Math.random()*100,y=Math.random()*80,s=Math.random()*3+.5,d=Math.random()*4;html+=`<div class="star" style="left:${x}%;top:${y}%;width:${s}px;height:${s}px;animation-delay:${d}s"></div>`;}
    // Wolken
    html+=`<div style="position:absolute;bottom:25px;left:5%;font-size:30px;opacity:.4">☁️</div>`;
    html+=`<div style="position:absolute;bottom:35px;right:5%;font-size:22px;opacity:.3">☁️</div>`;
    // Palast auf wolke
    html+=`<div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);text-align:center;animation:float 4s infinite">
      <div style="font-size:36px;filter:drop-shadow(0 0 12px #f9a8d4)">✨</div>
      <div style="font-size:24px;margin-top:-10px">🏯</div>
    </div>`;
    html+=`<div style="position:absolute;bottom:2px;left:8px;font-size:9px;color:#4b5563;font-family:'Cinzel',serif">${hb.name} · Lv ${lv}</div>`;
    html+=`</div>`;
  }

  html+=`<div style="position:absolute;bottom:4px;right:8px;font-size:9px;color:var(--purple2);font-family:'Cinzel',serif;font-style:italic">${hb.story.substring(0,40)}...</div>`;
  html+=buildWeatherOverlay();
  html+=`</div>`;
  return html;
}

// ═══════════════════════════════════════════════════════════════
// RENDERERS
// ═══════════════════════════════════════════════════════════════