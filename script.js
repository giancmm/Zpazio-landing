
function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.classList.toggle('hidden');
}

// WAVE effect
const canvas = document.getElementById("wave-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let waves = [];

function createWave(x, y) {
    waves.push({ x, y, radius: 0, alpha: 1 });
}

function drawWaves() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    waves.forEach((wave, index) => {
        ctx.beginPath();
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${wave.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        wave.radius += 1;
        wave.alpha -= 0.01;
        if (wave.alpha <= 0) {
            waves.splice(index, 1);
        }
    });
    requestAnimationFrame(drawWaves);
}

canvas.addEventListener("mousemove", (e) => {
    createWave(e.clientX, e.clientY);
});

drawWaves();
