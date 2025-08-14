
const hamburger = document.querySelector('[data-hamburger]');
const drawer = document.querySelector('[data-drawer]');
if (hamburger && drawer){ hamburger.addEventListener('click', ()=> drawer.classList.toggle('open')); }
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    const t = document.querySelector(id);
    if(t){
      e.preventDefault();
      t.scrollIntoView({behavior:'smooth', block:'start'});
      if(drawer) drawer.classList.remove('open');
    }
  });
});
