// overlay.js — versión con flag home/brands (ZPAZIO)
(function(){
  const isHome =
    location.pathname.endsWith('/') ||
    location.pathname.endsWith('index.html');
  document.documentElement.classList.add(isHome ? 'home' : 'brands');
  document.body.classList.add(isHome ? 'home' : 'brands');
})();
// (Tu código previo de overlay.js puede ir debajo)
