// --- Menú (hotfix click + z-index) ---
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');
  if (!menu || !toggle) return;

  const openMenu = ()=>{
    menu.classList.add('open');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = ()=>{
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    if (menu.classList.contains('open')) closeMenu(); else openMenu();
  });

  if (scrim){
    scrim.addEventListener('click', closeMenu);
  }
  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
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
addEventListener('mousemove', (e)=>{
  // Añade una nueva onda grande
  ripples.push({ x:e.clientX, y:e.clientY, r: 16, a: 0.9 });
});

function loop(){
  drawBase();

  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];

    // Región circular grande
    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();

    // Zoom y leve desplazamiento -> efecto de refracción
    const zoom = 1.10;  // más grande que antes
    const ox = (rp.x - canvas.width/2) * 0.012;
    const oy = (rp.y - canvas.height/2) * 0.012;

    // redibuja imagen con cover + zoom
    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih, cr = cw/ch;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = ch*zoom; dw = dh*ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    else { dw = cw*zoom; dh = dw/ir; dx = (cw-dw)/2 + ox; dy = (ch-dh)/2 + oy; }
    ctx.drawImage(img, dx, dy, dw, dh);

    // Anillo sutil para reforzar la onda (no es cursor, solo borde de la distorsión)
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a*0.25})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();

    // Avance: onda GRANDE (doble)
    rp.r += 3.2;   // crece más rápido (grande)
    rp.a -= 0.02;  // se desvanece más lento -> visible
    if (rp.a <= 0) ripples.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();
