
// --- Menú ---
document.getElementById('menu-toggle').addEventListener('click', ()=>{
  document.getElementById('menu').classList.toggle('hidden');
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


let ripples = [];
const TWO_PI = Math.PI * 2;

// Añadir ondas con variabilidad sutil para aspecto más orgánico
addEventListener('mousemove', (e)=>{
  const speed = Math.hypot((e.movementX||0), (e.movementY||0));
  const baseR = 12 + Math.min(speed, 18) * 0.4; // radio inicial depende un poco de la velocidad
  const growth = 2.2 + Math.random()*1.6;        // crecimiento por frame
  const fade = 0.016 + Math.random()*0.012;      // desvanecimiento
  const zoom = 1.06 + Math.random()*0.05;        // zoom local
  const ringAlpha = 0.18 + Math.random()*0.14;   // intensidad del anillo
  const wobbleAmp = 0.35 + Math.random()*0.45;   // oscilación del borde
  const phase = Math.random()*TWO_PI;
  ripples.push({
    x: e.clientX,
    y: e.clientY,
    r: baseR,
    a: 0.9,
    growth, fade, zoom, ringAlpha, wobbleAmp, phase,
    t: 0
  });
});

function loop(){
  drawBase();

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];
    rp.t += 1;

    // Región circular
    ctx.save();
    ctx.beginPath();

    // Borde con leve "wobble" para un look más natural
    const steps = 24;
    ctx.moveTo(rp.x + (rp.r + Math.sin(rp.t*0.12 + rp.phase)*rp.wobbleAmp), rp.y);
    for (let k=1; k<=steps; k++){
      const ang = k/steps * TWO_PI;
      const rr = rp.r + Math.sin(ang*3 + rp.t*0.12 + rp.phase)*rp.wobbleAmp;
      ctx.lineTo(rp.x + Math.cos(ang)*rr, rp.y + Math.sin(ang)*rr);
    }
    ctx.clip();

    // Redibuja imagen con cover + leve zoom local y desplazamiento de refracción
    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    const localZoom = rp.zoom;
    const ox = (rp.x - cw/2) * 0.010;
    const oy = (rp.y - ch/2) * 0.010;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*localZoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*localZoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    ctx.drawImage(img, dx, dy, dw, dh);

    // Anillo sutil con alpha variable
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, TWO_PI);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a * rp.ringAlpha})`;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    ctx.restore();

    // Avance de la onda
    rp.r += rp.growth;
    rp.a -= rp.fade;
    if (rp.a <= 0) ripples.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();
