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

let ripples = [];
let lastT = performance.now();

// Pequeño generador de ruido suave (suma de senos) para variaciones orgánicas
function softNoise(t, seed=0){
  return (
    Math.sin(t*0.45 + seed) * 0.55 +
    Math.sin(t*0.19 + seed*1.7) * 0.30 +
    Math.sin(t*0.08 + seed*2.3) * 0.15
  );
}

// Suavizado de velocidad del puntero
let prevX = null, prevY = null, smoothSpeed = 0;
addEventListener('mousemove', (e)=>{
  const x = e.clientX, y = e.clientY;
  if (prevX === null){ prevX = x; prevY = y; }
  const dx = x - prevX, dy = y - prevY;
  const instSpeed = Math.hypot(dx, dy);
  // filtro exponencial para suavizar
  smoothSpeed = smoothSpeed*0.85 + instSpeed*0.15;
  prevX = x; prevY = y;

  // Emitimos una onda solo si hay movimiento suficiente o cada ~70ms al mover
  const now = performance.now();
  if (!window.__lastEmit || (now - window.__lastEmit) > 70 || instSpeed > 2){
    window.__lastEmit = now;
    const baseR = 10 + Math.min(smoothSpeed, 40) * 0.25; // radio inicial según velocidad
    ripples.push({
      x, y,
      r: baseR,
      age: 0,
      life: 1.4 + Math.random()*0.5, // duración en segundos
      grow: 180 + Math.random()*80,  // px por segundo
      seed: Math.random()*10
    });
    // Evitar demasiadas ondas acumuladas
    if (ripples.length > 24) ripples.shift();
  }
});

function loop(){
  const now = performance.now();
  const dt = Math.min(0.05, (now - lastT)/1000); // delta en segundos, clamp a 50ms
  lastT = now;

  drawBase();

  // Oscilaciones globales sutiles (agua viva)
  const t = now/1000;
  const globalZoom = 1.0 + softNoise(t*0.6, 1)*0.005; // +-0.5%
  const globalOx = softNoise(t*0.8, 2)*2.0; // desplazamientos leves
  const globalOy = softNoise(t*0.7, 3)*2.0;

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];
    rp.age += dt;
    rp.r += rp.grow * dt; // crecimiento por tiempo real
    const k = 1.8; // tasa de decaimiento
    const alpha = Math.exp(-k * rp.age); // decaimiento suave

    // Si ya murió, remover
    if (rp.age > rp.life || alpha < 0.02){
      ripples.splice(i,1);
      continue;
    }

    // Distorsión con micro-variaciones (como flujo de agua alrededor del lente)
    const lfo = softNoise(t*1.2, rp.seed); // [-1..1]
    const localZoom = 1.05 + lfo*0.03;     // 1.05 ± 0.03
    const ox = (rp.x - canvas.width/2) * 0.006 + lfo*3 + globalOx;
    const oy = (rp.y - canvas.height/2) * 0.006 + lfo*3 + globalOy;

    // Clip circular suave
    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();

    // Redibujar imagen con cover + zoom local + drift global
    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*globalZoom*localZoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*globalZoom*localZoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    ctx.drawImage(img, dx, dy, dw, dh);

    // Borde con alpha suave (sin "wobble" poligonal para evitar look robótico)
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${alpha*0.20})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    ctx.restore();
  }

  requestAnimationFrame(loop);
}
loop();
