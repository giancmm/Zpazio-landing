function toggleMenu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Efecto ondas
const canvas = document.getElementById("wave-canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

document.addEventListener("mousemove", function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    for (let i = 0; i < 100; i++) {
        let x = mouseX + Math.sin(i + Date.now() * 0.002) * 50;
        let y = mouseY + Math.cos(i + Date.now() * 0.002) * 50;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    requestAnimationFrame(draw);
}
draw();
