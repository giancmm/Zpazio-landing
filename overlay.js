// --- Menú (robusto + UX premium) ---
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');
  if (!menu || !toggle) return;

  const closeMenu = ()=>{
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    document.body.classList.toggle('menu-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  if (scrim){
    scrim.addEventListener('click', closeMenu);
  }

  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeMenu();
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

// --- Onda (versión original que te gustaba) sobre la IMAGEN de fondo (canvas) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'background.jpg';

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

// === RIPPLE como en tu referencia ===
let ripples = [];
addEventListener('mousemove', (e)=>{
  ripples.push({ x:e.clientX, y:e.clientY, r: 16, a: 0.9 });
});

function loop(){
  drawBase();

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];

    // Región circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();

    // Refracción por zoom + leve desplazamiento (exacto como tu versión)
    const zoom = 1.10;
    const ox = (rp.x - canvas.width/2) * 0.012;
    const oy = (rp.y - canvas.height/2) * 0.012;

    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*zoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*zoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    ctx.drawImage(img, dx, dy, dw, dh);

    // Anillo sutil (igual que en tu referencia)
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a*0.25})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    // Avance tal cual
    rp.r += 3.2;
    rp.a -= 0.02;
    if (rp.a <= 0) ripples.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();
