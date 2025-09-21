<!doctype html>
<html lang="es">
<head>

<meta property="og:title" content="Flores Amarillas para Ti 💛">
<meta property="og:description" content="Un universo de amor solo para ti, Marlene.">
<meta property="og:image" content="https://ruta-de-una-imagen-romántica.jpg">
<meta property="og:type" content="website">

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Flores Amarillas — Para Marlene</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style>
  :root{
    --bg1: #071019;
    --bg2: #0b1620;
    --accent: #FFD54A; /* amarillo cálido */
    --accent-deep: #FFB300;
    --petal: #FFF2C2;
    --leaf: #2C7A3A;
    --glass: rgba(255,255,255,0.04);
    --card-radius: 14px;
    --max-width: 1100px;
    --safe-pad: 18px;
  }

  /* Reset & base */
  *{box-sizing:border-box}
  html,body{height:100%;margin:0;font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; -webkit-font-smoothing:antialiased; color:#fff;}
  body{
    background: radial-gradient(1200px 600px at 10% 10%, rgba(255,213,90,0.06), transparent 6%),
                radial-gradient(900px 500px at 90% 80%, rgba(255,150,50,0.03), transparent 6%),
                linear-gradient(180deg,var(--bg1), var(--bg2));
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
    padding:calc(var(--safe-pad) * 1.2);
  }

  /* Container */
  .stage{
    width:100%;
    max-width:var(--max-width);
    height:calc(100vh - 60px);
    border-radius:18px;
    position:relative;
    overflow:hidden;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), transparent 40%);
    box-shadow: 0 18px 50px rgba(2,6,12,0.7), inset 0 1px 0 rgba(255,255,255,0.02);
    padding:20px;
    display:flex;
    gap:20px;
    align-items:stretch;
  }

  /* left panel: message + controls */
  .panel{
    width:340px;
    min-width:260px;
    background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.03));
    border-radius:var(--card-radius);
    padding:18px;
    display:flex;
    flex-direction:column;
    gap:12px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.45);
  }
  .title{font-size:20px;font-weight:800;color:var(--accent);letter-spacing:0.4px}
  .subtitle{font-size:13px;color:rgba(255,255,255,0.72)}
  .big-heart{
    display:flex;gap:10px;align-items:center;margin-top:6px;
    font-weight:700;color:#fff;
  }

  .controls{margin-top:6px;display:flex;flex-direction:column;gap:8px}
  .btn{
    background:linear-gradient(180deg,var(--accent),var(--accent-deep));
    color:#111;padding:10px 12px;border-radius:12px;border:none;font-weight:700;cursor:pointer;
    box-shadow:0 8px 18px rgba(255,160,40,0.12);
  }
  .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,0.06);color:#fff;}
  .small{font-size:13px;padding:8px 10px;border-radius:10px}

  .info{font-size:13px;color:rgba(255,255,255,0.62);line-height:1.35}

  /* right: garden / interactive area */
  .garden{
    flex:1;
    position:relative;
    border-radius:12px;
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
    perspective:900px;
    transform-style:preserve-3d;
    background:
      radial-gradient(800px 300px at 20% 10%, rgba(255,235,160,0.02), transparent 10%),
      radial-gradient(600px 200px at 80% 80%, rgba(255,200,90,0.015), transparent 10%);
  }

  /* decorative sun & glow */
  .glow{
    position:absolute;left:12%;top:8%;width:220px;height:220px;border-radius:50%;
    background: radial-gradient(circle at 30% 30%, rgba(255,215,90,0.14), rgba(255,160,30,0.02) 45%, transparent 60%);
    filter:blur(28px);pointer-events:none;
  }

  /* field (3D) */
  .field{
    position:relative;width:100%;height:100%;transform-style:preserve-3d;overflow:visible;
    display:flex;align-items:center;justify-content:center;
  }

  /* ground */
  .ground{
    position:absolute;bottom:-6%;left:50%;transform:translateX(-50%) rotateX(76deg) translateZ(-90px);
    width:160%;height:220px;border-radius:50%;
    background: linear-gradient(180deg,#083318 0%, rgba(40,130,60,0.6) 100%);
    filter:blur(8px);opacity:0.55;
  }

  /* flower cluster */
  .cluster{
    position:relative;transform-style:preserve-3d;transform-origin:center center;
    transition:transform .28s cubic-bezier(.2,.9,.2,1);
    will-change:transform;
  }

  /* single flower */
  .flower{
    position:absolute;bottom:40px;left:50%;transform:translateX(-50%) translateZ(0);
    width:90px;height:90px;display:flex;align-items:center;justify-content:center;cursor:pointer;
    transform-style:preserve-3d;
  }

  /* stem */
  .stem{
    position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
    width:6px;height:120px;border-radius:8px;background:linear-gradient(180deg,#2E7D32,#155724);
    box-shadow:inset 0 -6px 8px rgba(0,0,0,0.25);
    transform-origin:bottom center;
  }
  .leaf{
    position:absolute;width:36px;height:18px;border-radius:20px;background:linear-gradient(90deg,#2C7A3A,#1B5E20);
    left:50%;top:40%;transform-origin:left center;box-shadow:0 6px 12px rgba(0,0,0,0.25);
  }

  /* petals: 8 petals in layered positions */
  .center{
    position:relative;width:48px;height:48px;border-radius:50%;
    background: radial-gradient(circle at 30% 30%, #FFF09F, #FFD54A 60%, #FFB300 100%);
    box-shadow: 0 8px 20px rgba(255,170,40,0.12), inset 0 -6px 12px rgba(0,0,0,0.06);
    z-index:4;transform:translateZ(30px);
    display:flex;align-items:center;justify-content:center;font-weight:800;color:#3b2000;
  }
  .petal{
    position:absolute;width:46px;height:60px;border-radius:50px 50px 40px 40px/60px 60px 40px 40px;
    background: linear-gradient(180deg,var(--petal), #FFE08A 60%);
    box-shadow:0 8px 18px rgba(0,0,0,0.2), inset 0 -6px 10px rgba(255,200,120,0.18);
    transform-origin:50% 80%;
    z-index:2;
    transition:transform .28s cubic-bezier(.2,.9,.2,1), filter .18s;
  }

  /* petal positions - rotate around center */
  .p1{transform: translateZ(18px) rotate(0deg) translateY(-30px) rotate(0deg);}
  .p2{transform: translateZ(16px) rotate(45deg) translateY(-28px) rotate(-20deg);}
  .p3{transform: translateZ(14px) rotate(90deg) translateY(-26px) rotate(-40deg);}
  .p4{transform: translateZ(12px) rotate(135deg) translateY(-24px) rotate(-60deg);}
  .p5{transform: translateZ(10px) rotate(180deg) translateY(-22px) rotate(-80deg);}
  .p6{transform: translateZ(8px) rotate(225deg) translateY(-20px) rotate(-100deg);}
  .p7{transform: translateZ(6px) rotate(270deg) translateY(-18px) rotate(-120deg);}
  .p8{transform: translateZ(4px) rotate(315deg) translateY(-16px) rotate(-140deg);}

  /* closed state (petals folded) */
  .flower.closed .petal{transform: translateZ(6px) rotate(0deg) translateY(-6px) scaleY(.52); filter:brightness(.98); opacity:0.95}
  .flower.closed .center{transform:translateZ(8px) scale(.9)}

  /* bloom animation */
  .flower.bloom .petal{transform: translateZ(32px) translateY(-34px) rotate(0deg) scale(1); filter:brightness(1.02);}
  .flower.bloom .p2{transform: translateZ(30px) rotate(45deg) translateY(-32px) rotate(-14deg)}
  .flower.bloom .p3{transform: translateZ(28px) rotate(90deg) translateY(-30px) rotate(-28deg)}
  .flower.bloom .p4{transform: translateZ(26px) rotate(135deg) translateY(-28px) rotate(-42deg)}
  .flower.bloom .p5{transform: translateZ(24px) rotate(180deg) translateY(-26px) rotate(-58deg)}
  .flower.bloom .p6{transform: translateZ(22px) rotate(225deg) translateY(-24px) rotate(-72deg)}
  .flower.bloom .p7{transform: translateZ(20px) rotate(270deg) translateY(-22px) rotate(-86deg)}
  .flower.bloom .p8{transform: translateZ(18px) rotate(315deg) translateY(-20px) rotate(-100deg)}
  .flower.bloom .center{transform:translateZ(38px) scale(1.05)}

  /* floating petals (falling animation) */
  .petal-fall{
    position:absolute;width:16px;height:24px;background:linear-gradient(180deg,#FFF7D6,#FFE6A4);
    border-radius:8px;opacity:0.95;pointer-events:none;z-index:1;transform:translateZ(0);
    filter:drop-shadow(0 8px 10px rgba(0,0,0,0.25));
  }

  /* message popup */
  .msg{
    position:absolute;top:18px;left:50%;transform:translateX(-50%);background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));padding:10px 14px;border-radius:12px;
    font-weight:700;color:var(--accent-deep);box-shadow:0 10px 30px rgba(0,0,0,0.45);backdrop-filter: blur(6px);
  }

  /* responsive */
  @media (max-width:920px){
    .panel{display:flex;width:100%;min-width:unset;order:2;flex-direction:row;gap:10px;padding:12px}
    .stage{flex-direction:column-reverse; padding:12px;height:calc(100vh - 34px)}
    .garden{height:58vh}
    .panel .title{font-size:16px}
  }

  @media (max-width:480px){
    .flower{width:72px;height:72px}
    .center{width:40px;height:40px}
  }
</style>
</head>
<body>
  <div class="stage" id="stage" aria-label="Jardín de flores amarillas para Marlene">
    <div class="panel" aria-hidden="false">
      <div>
        <div class="title">Para Marlene</div>
        <div class="subtitle">Un jardín de flores amarillas — cada flor guarda un mensaje</div>
        <div class="big-heart">🌼 <span style="color:var(--accent);">Flores Amarillas</span> — Mi sol</div>
      </div>

      <div class="controls" role="toolbar" aria-label="Controles">
        <button class="btn" id="bloomAll">Abrir todas las flores</button>
        <button class="btn ghost small" id="closeAll">Cerrar todas</button>
        <button class="btn ghost small" id="rains">Lluvia de pétalos</button>
        <button class="btn small" id="surprise">Mensaje sorpresa</button>
      </div>

      <div class="info" id="info">
        Toca cualquier flor para que se abra y vea su mensaje. Arrastra para mover la escena. En móvil, inclina el teléfono para un efecto suave.
      </div>
    </div>

    <div class="garden" id="garden" role="application">
      <div class="glow" aria-hidden="true"></div>
      <div class="field" id="field">
        <div class="ground" aria-hidden="true"></div>
        <div class="cluster" id="cluster" aria-live="polite" aria-atomic="true">
          <!-- Flores generadas por JS -->
        </div>
        <div class="msg" id="msg" style="display:none">Toca una flor 💛</div>
      </div>
    </div>
  </div>

<script>
/* JS puro: genera flores, interacciones, tilt, petalos que caen, mensajes */
const messages = [
  "Mi sol en días nublados",
  "Tu risa es mi brújula",
  "Eres mi calma y mi locura",
  "Contigo todo florece",
  "Eres mi abrazo eterno",
  "Mi razón y mi refugio",
  "Luz que guía mis pasos",
  "Mi permiso para soñar",
  "Mi promesa y mi pacto",
  "Latido que no falla",
  "Hoy, mañana y siempre",
  "Mi mejor sueño despierto",
  "Tu nombre canta en mí",
  "Reserva de ternura",
  "Mi abrazo en invierno",
  "Amor que sabe a hogar"
];

const stage = document.getElementById('stage');
const cluster = document.getElementById('cluster');
const msg = document.getElementById('msg');
const bBloomAll = document.getElementById('bloomAll');
const bCloseAll = document.getElementById('closeAll');
const bRains = document.getElementById('rains');
const bSurprise = document.getElementById('surprise');

let flowers = [];
let petalTimeouts = [];
let tiltEnabled = true;

/* helper random */
function rnd(min,max){ return Math.random()*(max-min)+min; }

/* create N flowers arranged in a loose semicircle */
const N = 8; // número de flores (puedes aumentar)
for(let i=0;i<N;i++){
  const fl = document.createElement('div');
  fl.className = 'flower closed';
  fl.setAttribute('role','button');
  fl.setAttribute('tabindex','0');
  fl.setAttribute('aria-label','Flor amarilla ' + (i+1));

  // position in arc
  const angle = (-40 + i*(80/(N-1))) * (Math.PI/180);
  const dist = 160 + (i%2)*18 + rnd(-18,18);
  const x = Math.sin(angle)*dist;
  const z = Math.cos(angle)*dist;
  const yOff = rnd(-6,12);

  fl.style.left = `calc(50% + ${x}px)`;
  fl.style.transform = `translateX(-50%) translateY(${yOff}px) translateZ(${z}px)`;

  // stem
  const stem = document.createElement('div'); stem.className='stem';
  const leaf = document.createElement('div'); leaf.className='leaf';
  leaf.style.transform = `translateX(-50%) rotate(${(i%2? -25: 22)}deg) translateY(${rnd(-8,6)}px)`;
  fl.appendChild(stem); fl.appendChild(leaf);

  // center & petals
  const center = document.createElement('div'); center.className='center';
  center.innerHTML = '<span style="font-size:12px">💛</span>';
  fl.appendChild(center);

  for(let p=1;p<=8;p++){
    const pet = document.createElement('div');
    pet.className = 'petal p' + p;
    fl.appendChild(pet);
  }

  // attach message index (wrap around)
  const msgIndex = i % messages.length;
  fl.dataset.msg = messages[msgIndex];

  // event handlers
  fl.addEventListener('click', ()=> toggleBloom(fl));
  fl.addEventListener('keydown', (e)=> { if(e.key==='Enter' || e.key===' ') toggleBloom(fl); });

  cluster.appendChild(fl);
  flowers.push(fl);
}

/* toggle bloom */
function toggleBloom(el){
  const opening = !el.classList.contains('bloom');
  if(opening){
    el.classList.remove('closed');
    el.classList.add('bloom');
    showMessage(el.dataset.msg);
    spawnPetals(el, 6);
  } else {
    el.classList.remove('bloom');
    el.classList.add('closed');
    clearMessage();
  }
}

/* show message bar */
function showMessage(text){
  msg.style.display = 'block';
  msg.textContent = text;
  msg.animate([{transform:'translateY(-8px)', opacity:0},{transform:'translateY(0)', opacity:1}], {duration:300, fill:'forwards', easing:'cubic-bezier(.2,.9,.2,1)'});
}

/* clear message */
function clearMessage(){
  msg.animate([{opacity:1},{opacity:0}], {duration:220, fill:'forwards'}).onfinish = ()=> msg.style.display='none';
}

/* bloom / close all */
bBloomAll.addEventListener('click', ()=>{
  flowers.forEach((f,i)=> {
    setTimeout(()=> { f.classList.remove('closed'); f.classList.add('bloom'); showMessage(f.dataset.msg); }, i*80);
  });
});
bCloseAll.addEventListener('click', ()=>{
  flowers.forEach((f,i)=> {
    setTimeout(()=> { f.classList.remove('bloom'); f.classList.add('closed'); }, i*40);
  });
  setTimeout(clearMessage, 300);
});

/* surprise message */
bSurprise.addEventListener('click', ()=>{
  const sweet = [
    "Marlene: mi sol, mi flor más brillante.",
    "Eres mi lugar favorito.",
    "Contigo quiero todo.",
    "Te amo más que ayer."
  ];
  const s = sweet[Math.floor(Math.random()*sweet.length)];
  showMessage(s);
  // little pulse
  stage.animate([{transform:'scale(1)'},{transform:'scale(1.01)'}],{duration:260, direction:'alternate', iterations:2});
});

/* petal spawn (floating) */
function spawnPetals(sourceEl, count=5){
  for(let i=0;i<count;i++){
    const pet = document.createElement('div');
    pet.className='petal-fall';
    const rect = sourceEl.getBoundingClientRect();
    const parentRect = cluster.getBoundingClientRect();
    const startX = rect.left + rect.width*Math.random() - parentRect.left;
    const startY = rect.top + rect.height*Math.random() - parentRect.top;

    pet.style.left = (startX) + 'px';
    pet.style.top = (startY) + 'px';
    pet.style.opacity = 0.95;
    pet.style.transform = `translateZ(${rnd(-30,20)}px) rotate(${rnd(0,360)}deg)`;
    cluster.appendChild(pet);

    // animate falling
    const endX = startX + rnd(-120,120);
    const endY = startY + rnd(160,420);
    pet.animate([
      {transform: pet.style.transform + ' translateY(0px) rotate(0deg)', opacity:1},
      {transform: `translateZ(${rnd(-120,-40)}px) translateY(${endY}px) rotate(${rnd(80,500)}deg)`, opacity:0.05}
    ], {duration: 2600 + Math.random()*1600, easing:'cubic-bezier(.2,.9,.1,.9)', fill:'forwards'}).onfinish = ()=> pet.remove();
  }
}

/* rains (burst of petals) */
let rainActive=false;
bRains.addEventListener('click', ()=>{
  rainActive = !rainActive;
  bRains.textContent = rainActive ? 'Parar lluvia' : 'Lluvia de pétalos';
  if(rainActive) startRain(); else stopRain();
});
let rainInterval;
function startRain(){
  rainInterval = setInterval(()=> {
    const idx = Math.floor(Math.random()*flowers.length);
    spawnPetals(flowers[idx], 8 + Math.floor(Math.random()*8));
  }, 420);
}
function stopRain(){ clearInterval(rainInterval); }

/* tilt: device orientation for subtle parallax */
let rotX = 0, rotY = 0;
function applyTransform(){
  cluster.style.transform = `translateZ(0px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
  requestAnimationFrame(applyTransform);
}
applyTransform();

if(window.DeviceOrientationEvent){
  window.addEventListener('deviceorientation', (e)=>{
    if(!tiltEnabled) return;
    const beta = e.beta || 0; // -180..180 front/back
    const gamma = e.gamma || 0; // -90..90 left/right
    // map to small rotations
    rotX = (beta - 60) * 0.08;
    rotY = gamma * 0.08;
  }, true);
}

/* drag to rotate scene */
let dragging=false, start={x:0,y:0}, startRot={x:0,y:0};
cluster.addEventListener('pointerdown', (e)=>{
  dragging=true; tiltEnabled=false;
  start.x = e.clientX; start.y = e.clientY;
  startRot.x = rotX; startRot.y = rotY;
  cluster.setPointerCapture(e.pointerId);
});
cluster.addEventListener('pointermove', (e)=>{
  if(!dragging) return;
  const dx = e.clientX - start.x;
  const dy = e.clientY - start.y;
  rotY = startRot.y + dx * 0.08;
  rotX = startRot.x - dy * 0.08;
});
window.addEventListener('pointerup', (e)=>{ dragging=false; tiltEnabled=true; try{ cluster.releasePointerCapture && cluster.releasePointerCapture(e.pointerId); }catch(err){} });

/* accessibility: keyboard nav through flowers */
let focusIndex = 0;
window.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight'){ focusIndex = (focusIndex+1)%flowers.length; flowers[focusIndex].focus(); }
  if(e.key === 'ArrowLeft'){ focusIndex = (focusIndex-1+flowers.length)%flowers.length; flowers[focusIndex].focus(); }
});

/* small auto sparkle: open first flower for a moment as hint */
setTimeout(()=>{ if(flowers[0]){ flowers[0].classList.remove('closed'); flowers[0].classList.add('bloom'); showMessage(flowers[0].dataset.msg); setTimeout(()=>{ flowers[0].classList.remove('bloom'); flowers[0].classList.add('closed'); setTimeout(clearMessage,240); }, 1500); } }, 900);

/* cleanup on unload */
window.addEventListener('beforeunload', ()=> { stopRain(); petalTimeouts.forEach(t => clearTimeout(t)); });

/* Optionally: expose function to change recipient name (e.g., Marlene) */
function setRecipient(name){
  // update title area quickly
  document.querySelector('.title').textContent = 'Para ' + name;
  // optional: surprise message
  showMessage(name + ', mi flor más brillante');
}
window.setRecipient = setRecipient;
</script>
</body>
</html>