// src/js/utils/scrollRow.js

export function initScrollRow(wrapperEl, trackSelector) {
  const track = wrapperEl.querySelector(trackSelector);
  const leftBtn = wrapperEl.querySelector(".row-arrow-left");
  const rightBtn = wrapperEl.querySelector(".row-arrow-right");

  if (!track || !leftBtn || !rightBtn) return;

  function scrollByPage(direction) {
    const amount = track.clientWidth * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  leftBtn.addEventListener("click", () => scrollByPage(-1));
  rightBtn.addEventListener("click", () => scrollByPage(1));
}