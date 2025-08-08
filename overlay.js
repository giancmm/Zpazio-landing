
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

let ripple = { x: 0, y: 0, radius: 0, alpha: 0 };

document.addEventListener("mousemove", (e) => {
  ripple.x = e.clientX;
  ripple.y = e.clientY;
  ripple.radius = 0;
  ripple.alpha = 1;
});

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (ripple.alpha > 0.01) {
    ripple.radius += 2;
    ripple.alpha *= 0.95;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = `rgba(255, 255, 255, ${ripple.alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  requestAnimationFrame(animate);
}
animate();

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});
