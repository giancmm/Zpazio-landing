(function(){
  const burger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (burger && menu){
    burger.addEventListener('click', ()=>{
      burger.classList.toggle('active'); menu.classList.toggle('open');
    });
    document.addEventListener('click', (e)=>{
      if (!menu.contains(e.target) && !burger.contains(e.target)){
        burger.classList.remove('active'); menu.classList.remove('open');
      }
    });
  }
  // highlight active link
  const path = location.pathname.split('/').pop();
  document.querySelectorAll('.menu a').forEach(a=>{
    if (a.getAttribute('href') === path){ a.style.background = '#efefef'; }
  });
})();