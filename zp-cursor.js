(function () {
  const ARROW_SRC = "/img/cursor-arrow.svg";
  const BULB_SRC  = "/img/cursor-bulb.svg";

  const ARROW_WIDTH  = 12;
  const BULB_WIDTH   = 18;
  const GAP_BETWEEN  = 6;
  const HOTSPOT_X = 1;
  const HOTSPOT_Y = 1;

  const cursor = document.createElement("div");
  cursor.id = "zp-cursor";
  cursor.innerHTML = `
    <img class="arrow" src="${ARROW_SRC}" alt="">
    <img class="bulb"  src="${BULB_SRC}"  alt="">
  `;
  document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(cursor);
  });

  document.addEventListener("mousemove", (e) => {
    const left = e.clientX - HOTSPOT_X;
    const top  = e.clientY - HOTSPOT_Y;
    cursor.style.transform = `translate(${left}px, ${top}px)`;
  });

  document.addEventListener("mouseenter", () => (cursor.style.display = "flex"));
  document.addEventListener("mouseleave", () => (cursor.style.display = "none"));
})();