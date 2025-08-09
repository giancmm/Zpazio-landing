
// overlay.js — activa indicador del ítem y parallax al abrir/cerrar (clases ya controlan el efecto)

document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');
  const links = Array.from((menu && menu.querySelectorAll('a')) || []);

  const openMenu = ()=>{ menu.classList.add('open'); document.body.classList.add('menu-open'); toggle?.setAttribute('aria-expanded','true'); };
  const closeMenu = ()=>{ menu.classList.remove('open'); document.body.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded','false'); };

  if (toggle){
    toggle.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
  }
  if (scrim){ scrim.addEventListener('click', closeMenu); }
  document.addEventListener('click', (e)=>{
    if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });

  // Indicador activo en el panel
  links.forEach(a=>{
    a.addEventListener('click', ()=>{
      links.forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      closeMenu(); // cierra con el efecto de salida + parallax
    });
  });
});

// Cursor Bombilla (igual que antes)
const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{ if (bulb) bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`; });
window.addEventListener('click', ()=>{ if (bulb){ bulb.classList.add('on'); setTimeout(()=> bulb.classList.remove('on'), 320); } });
