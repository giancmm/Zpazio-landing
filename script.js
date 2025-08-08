
const menu = document.getElementById("menu");

function toggleMenu() {
  menu.classList.toggle("hidden");
}

// Efecto de ondas con círculos pequeños
const overlay = document.getElementById("waveOverlay");
document.addEventListener("mousemove", e => {
  const circle = document.createElement("div");
  circle.className = "ripple";
  circle.style.left = e.clientX + "px";
  circle.style.top = e.clientY + "px";
  overlay.appendChild(circle);
  setTimeout(() => circle.remove(), 600);
});
