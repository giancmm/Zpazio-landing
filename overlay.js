// --- Menú ---
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  if (!menu || !toggle) return;

  toggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    menu.classList.toggle('open');
  });

  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      menu.classList.remove('open');
    }
  });
});
// --- Cursor Bombilla ---
const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
window.addEventListener('click', ()=>{
  bulb.classList.add('on');
  setTimeout(()=> bulb.classList.remove('on'), 320);
});

// --- Onda GRANDE sobre la IMAGEN de fondo (canvas) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'background.jpg';

// resize canvas
function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  if (img.complete) drawBase();
}
addEventListener('resize', resize);
resize();

img.onload = drawBase;

// Dibuja la imagen con 'cover'
function drawBase(){
  const iw = img.width, ih = img.height;
  const cw = canvas.width, ch = canvas.height;
  const ir = iw/ih, cr = cw/ch;
  let dw, dh, dx, dy;
  if (ir > cr){ dh = ch; dw = dh*ir; dx = (cw-dw)/2; dy = 0; }
  else { dw = cw; dh = dw/ir; dx = 0; dy = (ch-dh)/2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}



// --- Ondas fluidas (natural water-like) ---
// Principios:
// - Animación basada en tiempo real (dt), no por frame fijo -> evita "cámara lenta" o pasos robóticos.
// - Decaimiento exponencial suave y crecimiento dependiente de velocidad del cursor.
// - Distorsión tipo "lente" con micro-variaciones suaves (LFO) para sensación de fluido.


// --- Ondas ultra fluidas (feathered) ---
// Mejora clave: bordes "pluma" (feather) con halo suave en lugar de borde duro.
// - Animación por tiempo (dt) + suavizado de offsets (low-pass) para evitar tirones.
// - Emisión moderada con umbral de movimiento para cero "metralleta" de ondas.

let ripples = [];
let lastT = performance.now();

// Suavizado global de zoom y offsets (low-pass filter)
let gZoom = 1.0, gOx = 0, gOy = 0;

function lpf(current, target, alpha){ return current + (target - current)*alpha; }

function softNoise(t, seed=0){
  return (
    Math.sin(t*0.42 + seed) * 0.55 +
    Math.sin(t*0.19 + seed*1.7) * 0.30 +
    Math.sin(t*0.08 + seed*2.3) * 0.15
  );
}

let prevX=null, prevY=null, smoothSpeed=0;
let lastEmit = 0;
addEventListener('mousemove', (e)=>{
  const x=e.clientX, y=e.clientY;
  if (prevX===null){ prevX=x; prevY=y; }
  const dx=x-prevX, dy=y-prevY;
  const instSpeed = Math.hypot(dx, dy);
  smoothSpeed = smoothSpeed*0.88 + instSpeed*0.12;
  prevX=x; prevY=y;

  const now=performance.now();
  // umbral de movimiento y cooldown mínimo
  if ((instSpeed>0.8 && now-lastEmit>80) || (instSpeed>6 && now-lastEmit>40)){
    lastEmit=now;
    const baseR = 9 + Math.min(smoothSpeed, 36)*0.22;
    ripples.push({
      x, y,
      r: baseR,
      age: 0,
      life: 1.35 + Math.random()*0.45,  // segundos
      grow: 140 + Math.random()*90,     // px/s
      seed: Math.random()*10,
      halo: 18 + Math.random()*10       // tamaño del halo feather
    });
    if (ripples.length>18) ripples.shift();
  }
});

function loop(){
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastT)/1000);
  lastT = now;

  drawBase();

  // Objetivos globales con ruido suave
  const t = now/1000;
  const targetZoom = 1.0 + softNoise(t*0.6, 1)*0.004; // ±0.4%
  const targetOx = softNoise(t*0.8, 2)*1.6;
  const targetOy = softNoise(t*0.7, 3)*1.6;

  // Suavizado fuerte para evitar micro tirones
  gZoom = lpf(gZoom, targetZoom, 0.06);
  gOx   = lpf(gOx,   targetOx,   0.06);
  gOy   = lpf(gOy,   targetOy,   0.06);

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];
    rp.age += dt;
    rp.r += rp.grow * dt;
    const k = 1.55;
    const alpha = Math.exp(-k * rp.age);

    if (rp.age > rp.life || alpha < 0.02){
      ripples.splice(i,1);
      continue;
    }

    // Oscilación local muy sutil
    const lfo = softNoise(t*1.1, rp.seed)*0.02; // ±2%

    // Calcular cover + offsets con suavidad
    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    const localZoom = (1.035 + lfo) * gZoom;
    const ox = (rp.x - cw/2) * 0.006 + gOx;
    const oy = (rp.y - ch/2) * 0.006 + gOy;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*localZoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*localZoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }

    // Dibujo del contenido con recorte circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();
    ctx.drawImage(img, dx, dy, dw, dh);

    // Feather suave del borde: halo con shadowBlur en un círculo relleno casi transparente
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = rp.halo;
    ctx.shadowColor = `rgba(255,255,255,${alpha*0.12})`;
    ctx.fillStyle = 'rgba(255,255,255,0.001)'; // invisible, usamos la sombra
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r*0.98, 0, Math.PI*2);
    ctx.fill();

    // limpiar estado
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  requestAnimationFrame(loop);
}
loop();
