
document.getElementById('menu-toggle').addEventListener('click', ()=>{
  document.getElementById('menu').classList.toggle('hidden');
});

const bulb = document.getElementById('cursor-bulb');
window.addEventListener('mousemove',(e)=>{
  bulb.style.transform = `translate(${e.clientX+12}px, ${e.clientY+12}px)`;
});
window.addEventListener('click', ()=>{
  bulb.classList.add('on');
  setTimeout(()=> bulb.classList.remove('on'), 500);
});

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
  const iw = img.width, ih = img.height;
  const cw = canvas.width, ch = canvas.height;
  const ir = iw/ih, cr = cw/ch;
  let dw, dh, dx, dy;
  if (ir > cr){ dh = ch; dw = dh*ir; dx = (cw-dw)/2; dy = 0; }
  else { dw = cw; dh = dw/ir; dx = 0; dy = (ch-dh)/2; }
  ctx.drawImage(img, dx, dy, dw, dh);
}

let ripples = [];
addEventListener('mousemove', (e)=>{
  ripples.push({ x:e.clientX, y:e.clientY, r: 16, a: 0.9 });
});

function loop(){
  drawBase();

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
    ctx.drawImage(img, dx, dy, dw, dh);
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
