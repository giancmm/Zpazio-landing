document.addEventListener('DOMContentLoaded', ()=>{
  const menu = document.getElementById('menu');
  const toggle = document.getElementById('menu-toggle');
  const scrim = document.getElementById('menu-scrim');

  const openMenu = ()=>{ menu.classList.add('open'); document.body.classList.add('menu-open'); toggle.setAttribute('aria-expanded','true'); };
  const closeMenu = ()=>{ menu.classList.remove('open'); document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); };

  toggle.addEventListener('click', (e)=>{ e.stopPropagation(); menu.classList.contains('open') ? closeMenu() : openMenu(); });
  if (scrim) scrim.addEventListener('click', closeMenu);
  document.addEventListener('click', (e)=>{ if (!menu.contains(e.target) && !toggle.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMenu(); });
});

// Cursor Bombilla
const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  if (!bulb) return;
  bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
window.addEventListener('click', ()=>{
  if (!bulb) return;
  bulb.classList.add('on'); setTimeout(()=> bulb.classList.remove('on'), 320);
});
