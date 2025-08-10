
document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.querySelector(".menu-icon");
    const menu = document.getElementById("menu");
    const overlay = document.createElement("div");

    overlay.id = "overlay-bg";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "999";
    overlay.style.display = "none";

    document.body.appendChild(overlay);

    // Abrir menú
    openBtn.addEventListener("click", function () {
        menu.classList.add("open");
        overlay.style.display = "block";
    });

    // Cerrar menú haciendo clic fuera
    overlay.addEventListener("click", function () {
        menu.classList.remove("open");
        overlay.style.display = "none";
    });
});
