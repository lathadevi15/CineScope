    // src/js/utils/loadHeader.js

export async function loadHeader() {
  const placeholder = document.querySelector("#header-placeholder");
  if (!placeholder) return;

  try {
    const response = await fetch("header.html");
    if (!response.ok) throw new Error(`Failed to load header: ${response.status}`);

    const html = await response.text();
    placeholder.innerHTML = html;

    highlightActiveNavLink();

  } catch (error) {
    console.error("Header failed to load:", error);
  }
}

function highlightActiveNavLink() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  const link = document.querySelector(`.nav-links a[data-page="${currentPage}"]`);
  if (link) link.classList.add("active");
}