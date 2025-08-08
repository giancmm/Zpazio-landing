
const canvas = document.getElementById("effect-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let rippleArray = [];

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

class Ripple {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = 100;
    this.alpha = 1;
  }
  update() {
    this.radius += 1.5;
    this.alpha -= 0.01;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
    ctx.stroke();
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rippleArray.forEach((ripple, index) => {
    ripple.update();
    ripple.draw();
    if (ripple.alpha <= 0) {
      rippleArray.splice(index, 1);
    }
  });
  requestAnimationFrame(animate);
}
animate();

canvas.addEventListener("mousemove", (e) => {
  rippleArray.push(new Ripple(e.clientX, e.clientY));
});

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("menu").classList.toggle("hidden");
});
