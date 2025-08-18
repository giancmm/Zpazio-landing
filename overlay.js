
// Minimal overlay + menu logic — safe for links
(function(){
  function ready(fn){ document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn); }
  ready(function(){
    var menu   = document.getElementById('menu');
    var toggle = document.getElementById('menu-toggle');
    var scrim  = document.getElementById('menu-scrim');

    if (!menu || !toggle) return;

    function closeMenu(){
      menu.classList.remove('open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded','false');
    }
    function openMenu(){
      menu.classList.add('open');
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded','true');
    }
    toggle.addEventListener('click', function(){
      if (menu.classList.contains('open')) { closeMenu(); }
      else { openMenu(); }
    });
    if (scrim){ scrim.addEventListener('click', closeMenu); }
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });

    // Center-nav anchors should scroll if existen; si no, redirige a páginas
    var aNos = document.querySelector('a[href="#nosotros"]');
    var aEq  = document.querySelector('a[href="#equipo"]');
    var aCon = document.querySelector('a[href="#contacto"]');

    function bindAnchor(a, id, fallback){
      if(!a) return;
      a.addEventListener('click', function(ev){
        var target = document.getElementById(id);
        if (target){
          ev.preventDefault();
          target.scrollIntoView({behavior:'smooth', block:'start'});
        }else if (fallback){
          ev.preventDefault();
          window.location.href = fallback;
        }
      });
    }
    bindAnchor(aNos, 'nosotros', null);
    bindAnchor(aEq , 'equipo',   null);
    bindAnchor(aCon, 'contacto', 'contacto.html');
  });
})();
