
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.querySelector('.overlay').appendChild(canvas);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

function drawWave() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 40, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255,255,255,1)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 80, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    requestAnimationFrame(drawWave);
}

drawWave();

document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('menu').classList.toggle('active');
});
