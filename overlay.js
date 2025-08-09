
// --- Menú ---
document.getElementById('menu-toggle').addEventListener('click', ()=>{
  document.getElementById('menu').classList.toggle('hidden');
});

// --- Cursor Bombilla ---
const bulb = document.querySelector('.cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  // Offset un poco a la derecha y abajo del puntero
  bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});

// --- Ripple sobre la IMAGEN de fondo (canvas) ---
const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = 'background.jpg';

function resize(){
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  if (img.complete) drawBase();
}
addEventListener('resize', resize);
resize();

img.onload = drawBase;

function drawBase(){
  // Pintar imagen cubriendo todo el canvas (cover)
  const iw = img.width, ih = img.height;
  const cw = canvas.width, ch = canvas.height;
  const ir = iw/ih; const cr = cw/ch;
  let dw, dh, dx, dy;
  if (ir > cr){
    // imagen más ancha: ajustar alto
    dh = ch; dw = dh * ir;
    dx = (cw - dw)/2; dy = 0;
  } else {
    // imagen más alta: ajustar ancho
    dw = cw; dh = dw / ir;
    dx = 0; dy = (ch - dh)/2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

let ripples = [];
addEventListener('mousemove', (e)=>{
  ripples.push({ x:e.clientX, y:e.clientY, r: 8, a: 0.85 });
});

function loop(){
  // Primero dibujar base
  drawBase();

  // Luego aplicar "distorsión" local: re-dibujar zona recortada con un ligero zoom
  for (let i=ripples.length-1; i>=0; i--){
    const rp = ripples[i];

    // Clip circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.clip();

    // Redibujar la imagen con un leve zoom y desplazamiento hacia afuera para dar efecto de refracción
    const zoom = 1.06;                  // intensidad de la distorsión
    const ox = (rp.x - canvas.width/2) * 0.01;
    const oy = (rp.y - canvas.height/2) * 0.01;

    // Para cubrir el lienzo evitando bordes negros, volvemos a calcular cover con zoom
    const iw = img.width, ih = img.height;
    const cw = canvas.width, ch = canvas.height;
    const ir = iw/ih; const cr = cw/ch;
    let dw, dh, dx, dy;
    if (ir > cr){
      dh = ch*zoom; dw = dh * ir;
      dx = (cw - dw)/2 + ox; dy = (ch - dh)/2 + oy;
    } else {
      dw = cw*zoom; dh = dw / ir;
      dx = (cw - dw)/2 + ox; dy = (ch - dh)/2 + oy;
    }
    ctx.drawImage(img, dx, dy, dw, dh);

    // Anillo fino para reforzar la onda (opcional, muy sutil)
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI*2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a*0.35})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();

    // Avance de la onda
    rp.r += 1.4;     // mismo tamaño relativo (crece suave)
    rp.a -= 0.03;    // se desvanece lento (visible)
    if (rp.a <= 0) ripples.splice(i,1);
  }

  requestAnimationFrame(loop);
}
loop();
