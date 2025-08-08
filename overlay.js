
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

document.addEventListener("mousemove", function(e) {
    const x = e.clientX;
    const y = e.clientY;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(x, y, i * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${1 - i / 10})`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
});
