
// Toggle menu
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('menu').classList.toggle('hidden');
});

// Waves (pronunciadas pero mismo tamaño)
const layer = document.querySelector('.overlay');
const canvas = document.createElement('canvas');
layer.appendChild(canvas);
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resize);
resize();

let ripples = [];
addEventListener('mousemove', (e) => {
  ripples.push({ x: e.clientX, y: e.clientY, r: 0, alpha: 1 });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.alpha})`;
    ctx.lineWidth = 2;         // más fuerte
    ctx.shadowBlur = 12;       // glow sutil
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    rp.r += 1.6;               // misma escala aprox
    rp.alpha -= 0.03;          // se desvanece más lento (más visible)
    if (rp.alpha <= 0) ripples.splice(i, 1);
  }
  requestAnimationFrame(draw);
}
draw();
