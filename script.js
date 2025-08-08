
document.addEventListener('mousemove', (e) => {
  const cursor = document.getElementById('cursor-effect');
  cursor.style.left = `${e.clientX - 40}px`;
  cursor.style.top = `${e.clientY - 40}px`;
});

function toggleMenu() {
  const menu = document.getElementById("menu");
  menu.style.display = (menu.style.display === "block") ? "none" : "block";
}
