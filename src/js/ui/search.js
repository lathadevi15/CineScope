// src/js/ui/search.js

import { searchMovies } from "../api.js";
import { debounce } from "../utils/debounce.js";
import { IMAGE_BASE_URL } from "../config.js";

// Reusable core: wires up debounced searching for ANY input + results pair.
// Both the desktop inline search box and the mobile modal call this,
// so the fetch/render logic only ever needs to exist once.
function attachSearchBehavior(inputEl, resultsEl) {
  const debouncedSearch = debounce(handleInput, 400);
  inputEl.addEventListener("input", debouncedSearch);

  async function handleInput(event) {
    const query = event.target.value.trim();

    if (query.length < 2) {
      hideResults();
      return;
    }

    resultsEl.innerHTML = `<p class="search-status">Searching...</p>`;
    showResults();

    try {
      const movies = await searchMovies(query);
      renderResults(movies);
    } catch (error) {
      resultsEl.innerHTML = `<p class="search-status error">Something went wrong.</p>`;
    }
  }

  function renderResults(movies) {
    if (movies.length === 0) {
      resultsEl.innerHTML = `<p class="search-status">No movies found.</p>`;
      return;
    }

    const html = movies
      .slice(0, 8)
      .map((movie) => {
        const poster = movie.poster_path
          ? `${IMAGE_BASE_URL}${movie.poster_path}`
          : "https://via.placeholder.com/92x138?text=No+Image";
        const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

        return `
          <a class="search-result-item" href="movie-details.html?id=${movie.id}">
            <img src="${poster}" alt="${movie.title}" />
            <div class="search-result-info">
              <p class="search-result-title">${movie.title}</p>
              <p class="search-result-year">${year}</p>
            </div>
          </a>
        `;
      })
      .join("");

    resultsEl.innerHTML = html;
  }

  function showResults() {
    resultsEl.classList.add("active");
  }

  function hideResults() {
    resultsEl.classList.remove("active");
    resultsEl.innerHTML = "";
  }

  return { hideResults };
}

export function initSearch() {
  const desktopInput = document.querySelector(".search-box input");
  const desktopResults = document.querySelector(".search-results");

  if (desktopInput && desktopResults) {
    attachSearchBehavior(desktopInput, desktopResults);

    document.addEventListener("click", (event) => {
      const clickedInside = event.target.closest(".search-box") || event.target.closest(".search-results");
      if (!clickedInside) {
        desktopResults.classList.remove("active");
        desktopResults.innerHTML = "";
      }
    });
  }

  setupMobileSearch();
}

function setupMobileSearch() {
  const triggerBtn = document.querySelector(".search-icon-btn");
  const overlay = document.querySelector(".mobile-search-overlay");
  const closeBtn = document.querySelector(".mobile-search-close");
  const mobileInput = document.querySelector(".mobile-search-input");
  const mobileResults = document.querySelector(".mobile-search-results");

  if (!triggerBtn || !overlay || !mobileInput || !mobileResults) return;

  // Wire up the same search behavior, just pointed at the modal's own
  // input and results elements instead of the desktop ones.
  attachSearchBehavior(mobileInput, mobileResults);

  function openModal() {
    overlay.classList.add("active");
    document.body.classList.add("nav-open"); // reuse the same scroll-lock as the nav drawer
    mobileInput.focus();
  }

  function closeModal() {
    overlay.classList.remove("active");
    document.body.classList.remove("nav-open");
    mobileInput.value = "";
    mobileResults.innerHTML = "";
    mobileResults.classList.remove("active");
  }

  triggerBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);

  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("active")) {
      closeModal();
    }
  });
}