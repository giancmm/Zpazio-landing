
// --- Menú (igual que tenías) ---
document.addEventListener('DOMContentLoaded', ()=>{
  const menu = ;
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


// === WhatsApp Floating Button ===
(function(){
  // Configuración: pon aquí tu número en formato internacional SIN signos (+) ni espacios. Ej: 573001112233
  var WHATSAPP_NUMBER = window.ZPAZIO_WHATSAPP_NUMBER || "573001112233";
  var DEFAULT_TEXT = encodeURIComponent("Hola, quiero asesoría de iluminación con Zpazio.");
  try{
    var link = document.createElement('a');
    link.className = 'whatsapp-fab';
    link.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + DEFAULT_TEXT;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute('aria-label','Chatear por WhatsApp');

    // Ícono WhatsApp (SVG inline, sin dependencias)
    link.innerHTML = '<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'+
      '<stop offset="0%" stop-color="#25D366"/><stop offset="100%" stop-color="#128C7E"/></linearGradient></defs>'+
      '<circle cx="16" cy="16" r="15" fill="url(#g)" opacity="0.95"/>'+
      '<path fill="#fff" d="M20.6 17.2c-.3-.2-1.9-.9-2.2-1s-.5-.2-.7.2-.8 1-1 1.2c-.2.2-.4.2-.7 0-.3-.2-1.3-.5-2.5-1.6-1-.9-1.6-2-1.8-2.3-.2-.3 0-.5.2-.7.2-.2.3-.4.5-.6.2-.2.3-.4.4-.6s0-.4 0-.6c0-.2-.7-1.7-1-2.3-.3-.5-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.6 1.1 3 1.3 3.2c.2.3 2.1 3.3 5.1 4.6.7.3 1.3.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.9-.8 2.1-1.6.3-.8.3-1.5.2-1.6 0-.1-.3-.2-.6-.4z"/>'+
      '</svg>';

    document.body.appendChild(link);
  }catch(e){
    console && console.warn && console.warn('WhatsApp FAB error:', e);
  }
})();


// Scroll suave en Home para el botón Nosotros
(function(){
  try{
    var link = document.querySelector('a.btn-link[href="#nosotros"]');
    var target = document.getElementById('nosotros');
    if(!link || !target) return;
    link.addEventListener('click', function(e){
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.classList.add('hi-lite');
      setTimeout(function(){ target.classList.remove('hi-lite'); }, 800);
    });
  }catch(e){}
})();


// Scroll suave para Equipo en Home
(function(){
  try{
    var link = document.querySelector('a.btn-link[href="#equipo"]');
    var target = document.getElementById('equipo');
    if(!link || !target) return;
    link.addEventListener('click', function(e){
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }catch(e){}
})();


// Redirect Contacto anchor to contacto.html (safety)
(function(){
  try{
    var cta = document.querySelector('a[href="#contacto"]');
    if(!cta) return;
    cta.addEventListener('click', function(e){
      e.preventDefault();
      window.location.href = 'contacto.html';
    });
  }catch(e){}
})();
