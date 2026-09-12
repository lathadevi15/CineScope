// src/js/utils/mobileNav.js

export function initMobileNav() {
  const toggleBtn = document.querySelector(".menu-toggle-btn");
  const closeBtn = document.querySelector(".nav-close-btn");
  const nav = document.querySelector("#main-navbar");
  const overlay = document.querySelector(".nav-overlay");

  if (!toggleBtn || !nav || !overlay) return;

  function openDrawer() {
    nav.classList.add("open");
    overlay.classList.add("active");
    document.body.classList.add("nav-open"); // locks background scroll
  }

  function closeDrawer() {
    nav.classList.remove("open");
    overlay.classList.remove("active");
    document.body.classList.remove("nav-open");

    // Collapse any expanded dropdown submenus when the drawer closes,
    // so it opens fresh next time rather than remembering old state.
    nav.querySelectorAll(".dropdown.open").forEach((li) => li.classList.remove("open"));
  }

  toggleBtn.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  // Dropdown links (Movies ▾, TV Shows ▾, etc.) have href="#" — clicking
  // them should expand/collapse their submenu, not jump the page to the top.
  nav.querySelectorAll(".dropdown > a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const parentLi = link.closest(".dropdown");
      parentLi.classList.toggle("open");
    });
  });
}