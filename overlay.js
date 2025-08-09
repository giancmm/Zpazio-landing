
'use strict';

// Canvas para ondas
const layer = document.querySelector('.overlay');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d', { alpha: true });
layer.appendChild(canvas);

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
addEventListener('resize', resize);
resize();

let ripples = [];
addEventListener('mousemove', (e) => {
  ripples.push({ x: e.clientX, y: e.clientY, r: 0, a: 0.9 });
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = ripples.length - 1; i >= 0; i--) {
    const rp = ripples[i];
    ctx.beginPath();
    ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${rp.a})`;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255,255,255,0.6)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    rp.r += 1.6;   // tamaño pequeño, crecimiento suave
    rp.a -= 0.03;  // se desvanece lentamente (más visible)
    if (rp.a <= 0) ripples.splice(i, 1);
  }

  requestAnimationFrame(draw);
}
draw();
