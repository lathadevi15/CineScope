// src/js/moviesList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianMoviesPool } from "./api.js";
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

let activeMovies = [];
let shownCount = 0;
let currentSort = "popularity-descending";
let selectedGenreId = null;
let requestId = 0; // guards against a slow, stale fetch overwriting a newer one

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

async function applyFilters() {
  const thisRequestId = ++requestId;

  const from = searchAllCheckbox.checked ? null : fromInput.value;
  const to = searchAllCheckbox.checked ? null : toInput.value;

  grid.innerHTML = `<p class="status">Loading movies...</p>`;
  loadMoreWrapper.style.display = "none";

  try {
    const pool = await buildIndianMoviesPool({
      category,
      genreId: selectedGenreId,
      fromDate: from,
      toDate: to
    });

    if (thisRequestId !== requestId) return; // a newer request superseded this one

    activeMovies = pool;
    shownCount = PAGE_SIZE;

    if (activeMovies.length === 0) {
      grid.innerHTML = `<p class="status">No Indian movies match these filters right now.</p>`;
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

sortForm.addEventListener("change", (event) => {
  currentSort = event.target.id;
  renderVisible();
});

searchAllCheckbox.addEventListener("change", () => {
  const disabled = searchAllCheckbox.checked;
  fromInput.disabled = disabled;
  toInput.disabled = disabled;
  applyFilters();
});

fromInput.addEventListener("change", applyFilters);
toInput.addEventListener("change", applyFilters);

// One listener on the container, not fifteen on each button — event delegation.
genreContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".genre-btn");
  if (!btn) return;
  btn.classList.toggle("selected");

  const clickedId = btn.dataset.genreId;

  // Clicking the already-active genre again clears the filter (toggle off).
  if (selectedGenreId === clickedId) {
    selectedGenreId = null;
    btn.classList.remove("active");
  } else {
    genreContainer.querySelectorAll(".genre-btn").forEach((b) => b.classList.remove("active"));
    selectedGenreId = clickedId;
    btn.classList.add("active");
  }

  applyFilters();
});

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "Movies";

  const defaultRadio = document.querySelector(`#${currentSort}`);
  if (defaultRadio) defaultRadio.checked = true;

  await applyFilters();
}

init();