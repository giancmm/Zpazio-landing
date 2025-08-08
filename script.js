
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

let rippleArray = [];

function drawRipple(x, y) {
    let radius = 0;
    const maxRadius = 150;
    const ripple = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rippleArray = rippleArray.filter(r => r.radius < maxRadius);
        rippleArray.push({ x, y, radius });
        for (let r of rippleArray) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, 2 * Math.PI);
            ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 2;
            ctx.stroke();
            r.radius += 2;
        }
    }, 16);
    setTimeout(() => clearInterval(ripple), 1000);
}

document.addEventListener("mousemove", e => {
    drawRipple(e.clientX, e.clientY);
});

function toggleMenu() {
    const menu = document.getElementById("menu");
    menu.classList.toggle("hidden");
}
