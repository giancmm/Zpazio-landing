// overlay.js — FIX: vuelve el fondo y evita pantalla blanca si hay error
// Incluye: menú con indicador activo + parallax, cursor, y efecto agua 2D estable.

/* =================== MENÚ =================== */
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');
  const links = Array.from((menu && menu.querySelectorAll('a')) || []);
  if (!menu || !toggle) return;

  const openMenu = ()=>{ menu.classList.add('open'); document.body.classList.add('menu-open'); toggle.setAttribute('aria-expanded','true'); };
  const closeMenu = ()=>{ menu.classList.remove('open'); document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); };

  toggle.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
  if (scrim) scrim.addEventListener('click', closeMenu);
  document.addEventListener('click', (e)=>{ if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });

  links.forEach(a=>{
    a.addEventListener('click', ()=>{
      links.forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      closeMenu();
    });
  });
});

/* ============== CURSOR BOMBILLA ============== */
const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  if (bulb) bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
window.addEventListener('click', ()=>{
  if (bulb){ bulb.classList.add('on'); setTimeout(()=> bulb.classList.remove('on'), 320); }
});

/* ============== FONDO + AGUA 2D (fail-safe) ============== */
(function(){
  const canvas = document.getElementById('bgCanvas');
  if (!canvas){ console.warn('No se encontró #bgCanvas'); return; }
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.src = 'background.jpg';

  let vw = innerWidth, vh = innerHeight;
  function resize(){
    vw = innerWidth; vh = innerHeight;
    canvas.width = vw; canvas.height = vh;
    if (img.complete && img.naturalWidth) drawBase();
  }
  addEventListener('resize', resize);
  resize();

  img.onload = drawBase;
  img.onerror = ()=>{
    console.error('No se pudo cargar background.jpg — oculto el canvas para evitar pantalla blanca.');
    canvas.style.display = 'none';
  };

  function drawBase(){
    const iw = img.width, ih = img.height;
    const ir = iw/ih, cr = vw/vh;
    let dw, dh, dx, dy;
    if (ir > cr){ dh = vh; dw = dh*ir; dx = (vw-dw)/2; dy = 0; }
    else { dw = vw; dh = dw/ir; dx = 0; dy = (vh-dh)/2; }
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // Agua suave
  const ripples = [];
  let targetX = vw*0.5, targetY = vh*0.5;
  addEventListener('mousemove', (e)=>{
    targetX = e.clientX; targetY = e.clientY;
    ripples.push({ x: targetX, y: targetY, r: 14, a: 0.9, grow: 3.0 });
  });

  function n2(t, a=1, b=1){ return Math.sin(t*a)*0.5 + Math.cos(t*b)*0.5; }

  let tprev = performance.now();
  function loop(){
    const t = performance.now()*0.001;
    const dt = Math.min(0.033, (performance.now()-tprev)/1000);
    tprev = performance.now();

    // Flujo global sutil
    const gAmp = 14;
    const gox = n2(t*0.25, 0.7, 1.1) * gAmp;
    const goy = n2(t*0.28, 0.9, 1.3) * gAmp;

    drawBase();

    for (let i=ripples.length-1; i>=0; i--){
      const rp = ripples[i];
      ctx.save();
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
      ctx.clip();

      const iw = img.width, ih = img.height;
      const ir = iw/ih, cr = vw/vh;
      let dw, dh, dx, dy;
      const zoom = 1.06 + (rp.a*0.05);
      if (ir > cr){ dh = vh*zoom; dw = dh*ir; dx = (vw-dw)/2; dy = (vh-dh)/2; }
      else { dw = vw*zoom; dh = dw/ir; dx = (vw-dw)/2; dy = (vh-dh)/2; }

      const pullX = (rp.x - vw/2) * 0.010;
      const pullY = (rp.y - vh/2) * 0.010;
      const wobbleX = gox * 0.06;
      const wobbleY = goy * 0.06;

      ctx.drawImage(img, dx + pullX + wobbleX, dy + pullY + wobbleY, dw, dh);

      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
      ctx.strokeStyle = `rgba(255,255,255,${rp.a*0.22})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      ctx.restore();

      rp.r += rp.grow * (1 + rp.a*0.6) * (1 + dt);
      rp.a -= 0.018 * (1 + dt*10);
      if (rp.a <= 0.02) ripples.splice(i,1);
    }

    requestAnimationFrame(loop);
  }
  loop();
})();