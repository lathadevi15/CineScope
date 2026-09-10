// src/js/moviesList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianMoviesPool, fetchAllLanguages } from "./api.js";
import { renderMovieCard } from "./ui/renderMovies.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const CATEGORY_TITLES = {
  popular: "Popular Movies",
  trending: "Trending Movies",
  top_rated: "Top Rated Movies",
  now_playing: "Now Playing",
  upcoming: "Upcoming Movies"
};

const PAGE_SIZE = 20;

const params = new URLSearchParams(window.location.search);
const category = params.get("category") || "popular";

const titleEl = document.querySelector(".list-title");
const grid = document.querySelector(".movie-grid-full");
const loadMoreBtn = document.querySelector(".btn-load-more");
const loadMoreWrapper = document.querySelector(".load-more-wrapper");
const sortForm = document.querySelector(".filters-content form");
const searchAllCheckbox = document.querySelector("#search-all-releases");
const fromInput = document.querySelector("#release-from");
const toInput = document.querySelector("#release-to");
const genreContainer = document.querySelector(".genre-filter");
const languageSelect = document.querySelector("#language-select");
const applyFiltersBtn = document.querySelector("#apply-filters-btn");

let activeMovies = [];
let shownCount = 0;
let currentSort = "popularity-descending";
let requestId = 0;

// Pending selections — what the user has clicked/typed, but not yet applied.
// These only take effect once the Filter button is clicked.
// Pending selections — what the user has clicked, but not yet applied.
let pendingGenreIds = new Set();

function sortMovies(movies, sortBy) {
  const sorted = [...movies];
  switch (sortBy) {
    case "popularity-descending":
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case "popularity-ascending":
      return sorted.sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    case "rating-descending":
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case "rating-ascending":
      return sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    case "release-date-descending":
      return sorted.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    case "release-date-ascending":
      return sorted.sort((a, b) => (a.release_date || "").localeCompare(b.release_date || ""));
    default:
      return sorted;
  }
}

function renderVisible() {
  const sorted = sortMovies(activeMovies, currentSort);
  const visible = sorted.slice(0, shownCount);

  grid.innerHTML = visible.length > 0 ? "" : `<p class="status">No movies match these filters.</p>`;
  visible.forEach((movie) => grid.appendChild(renderMovieCard(movie)));

  loadMoreWrapper.style.display = shownCount >= sorted.length ? "none" : "flex";
}

function showMore() {
  shownCount += PAGE_SIZE;
  renderVisible();
}

// Fires a fresh fetch using whatever is currently pending — called only
// when the Filter button is clicked, or once automatically on page load.
async function fetchAndApply() {
  const thisRequestId = ++requestId;

  const from = searchAllCheckbox.checked ? null : fromInput.value;
  const to = searchAllCheckbox.checked ? null : toInput.value;
  const language = languageSelect.value || null;
  const genreIds = pendingGenreIds.size > 0 ? Array.from(pendingGenreIds) : null;

  grid.innerHTML = `<p class="status">Loading movies...</p>`;
  loadMoreWrapper.style.display = "none";

  try {
    const pool = await buildIndianMoviesPool({
      category,
      genreIds,
      fromDate: from,
      toDate: to,
      language
    });

    if (thisRequestId !== requestId) return;

    activeMovies = pool;
    shownCount = PAGE_SIZE;

    if (activeMovies.length === 0) {
      grid.innerHTML = `<p class="status">No movies match these filters right now.</p>`;
      return;
    }

    renderVisible();

  } catch (error) {
    if (thisRequestId !== requestId) return;
    console.error("Movie pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
  }
}

loadMoreBtn.addEventListener("click", showMore);

// Sorting stays instant — it's free (no fetch), so no reason to gate it
// behind the Filter button.
sortForm.addEventListener("change", (event) => {
  currentSort = event.target.id;
  renderVisible();
});

// Everything below only updates PENDING state — no fetch happens here.

searchAllCheckbox.addEventListener("change", () => {
  const disabled = searchAllCheckbox.checked;
  fromInput.disabled = disabled;
  toInput.disabled = disabled;
  // No fetchAndApply() call — waits for the Filter button.
});

genreContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".genre-btn");
  if (!btn) return;

  const clickedId = btn.dataset.genreId;

  if (pendingGenreIds.has(clickedId)) {
    pendingGenreIds.delete(clickedId);
    btn.classList.remove("active");
  } else {
    pendingGenreIds.add(clickedId);
    btn.classList.add("active");
  }
  // No fetchAndApply() call — waits for the Filter button, same as before.
});

// The ONE place that actually triggers a new fetch from user interaction.
applyFiltersBtn.addEventListener("click", fetchAndApply);

async function populateLanguageDropdown() {
  try {
    const languages = await fetchAllLanguages();
    const optionsHtml = languages
      .map((lang) => `<option value="${lang.iso_639_1}">${lang.english_name}</option>`)
      .join("");
    languageSelect.insertAdjacentHTML("beforeend", optionsHtml);
  } catch (error) {
    console.error("Language dropdown failed to populate:", error);
  }
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "Movies";

  const defaultRadio = document.querySelector(`#${currentSort}`);
  if (defaultRadio) defaultRadio.checked = true;

  populateLanguageDropdown();       // independent — doesn't block movie loading
  await fetchAndApply();            // initial load, using default filter state
}

init();