
// --- Menú (igual que tenías) ---
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

  if (scrim){ scrim.addEventListener('click', closeMenu); }
  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });
});

// --- Cursor Bombilla (igual) ---
const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  if (!bulb) return;
  bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
window.addEventListener('click', ()=>{
  if (!bulb) return;
  bulb.classList.add('on');
  setTimeout(()=> bulb.classList.remove('on'), 320);
});

// --- Canvas + imagen de fondo con fallback ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const img = new Image();
// cache-busting para GitHub Pages
img.src = 'background.jpg?v=20250810';

function resize(){
  if (!canvas || !ctx) return;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  if (img.complete && img.naturalWidth > 0) {
    drawBase();
  } else {
    // Fallback visual: fondo oscuro para evitar pantalla blanca
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }
}
addEventListener('resize', resize);
resize();

img.onload = drawBase;
img.onerror = ()=>{
  // Si falla la imagen, deja un fondo oscuro y no rompe nada
  if (!canvas || !ctx) return;
  ctx.fillStyle = '#0b0b0b';
  ctx.fillRect(0,0,canvas.width,canvas.height);
};

// Dibuja la imagen con 'cover'
function drawBase(){
  if (!canvas || !ctx || !(img.naturalWidth>0)) return;
  const iw = img.width, ih = img.height;
  const cw = canvas.width, ch = canvas.height;
  const ir = iw/ih, cr = cw/ch;
  let dw, dh, dx, dy;
  if (ir > cr){ dh = ch; dw = dh*ir; dx = (cw-dw)/2; dy = 0; }
  else { dw = cw; dh = dw/ir; dx = 0; dy = (ch-dh)/2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

// === Ripple como lo tenías ===
let ripples = [];
addEventListener('mousemove', (e)=>{
  ripples.push({ x:e.clientX, y:e.clientY, r: 16, a: 0.9 });
});

function loop(){
  if (!canvas || !ctx){
    requestAnimationFrame(loop);
    return;
  }

  if (img.complete && img.naturalWidth > 0){
    drawBase();
  } else {
    ctx.fillStyle = '#0b0b0b';
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];

    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();

    const zoom = 1.10;
    const ox = (rp.x - canvas.width/2) * 0.012;
    const oy = (rp.y - canvas.height/2) * 0.012;

    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*zoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*zoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    if (img.complete && img.naturalWidth > 0){
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // Fallback de la “onda” si no hay imagen aún
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(0,0,cw,ch);
    }

    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a*0.25})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    rp.r += 3.2;
    rp.a -= 0.02;
    if (rp.a <= 0) ripples.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();
