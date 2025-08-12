(function(){
  try{
    var isHome = location.pathname.endsWith('/') || location.pathname.endsWith('index.html');
    document.documentElement.classList.add(isHome ? 'home' : 'brands');
    document.body.classList.add(isHome ? 'home' : 'brands');
  }catch(e){}
})();