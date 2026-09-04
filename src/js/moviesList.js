// src/js/moviesList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianMoviesByCategoryPool, buildIndianMoviesByDateRange } from "./api.js";
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

let allMovies = [];      // the default category pool (popularity-based)
let activeMovies = [];   // whichever pool is currently in effect — category pool, or a date-scoped fetch
let shownCount = 0;
let currentSort = "popularity-descending";
let dateRequestId = 0;   // guards against a slow, stale fetch overwriting a newer one

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

  grid.innerHTML = visible.length > 0
    ? ""
    : `<p class="status">No movies match this date range.</p>`;

  visible.forEach((movie) => grid.appendChild(renderMovieCard(movie)));

  loadMoreWrapper.style.display = shownCount >= sorted.length ? "none" : "flex";
}

function showMore() {
  shownCount += PAGE_SIZE;
  renderVisible();
}

function resetAndRender() {
  shownCount = PAGE_SIZE;
  renderVisible();
}

async function applyDateFilter() {
  const from = fromInput.value;
  const to = toInput.value;

  // "Search all releases" checked, or no dates chosen yet — just use the
  // original category pool, no extra fetch needed.
  if (searchAllCheckbox.checked || (!from && !to)) {
    activeMovies = allMovies;
    resetAndRender();
    return;
  }

  const thisRequestId = ++dateRequestId;

  grid.innerHTML = `<p class="status">Searching movies${from ? ` from ${from}` : ""}${to ? ` to ${to}` : ""}...</p>`;
  loadMoreWrapper.style.display = "none";

  try {
    const pool = await buildIndianMoviesByDateRange(from, to);

    // If the user changed the date again before this finished, ignore this
    // now-stale result — only the most recent request should win.
    if (thisRequestId !== dateRequestId) return;

    activeMovies = pool;

    if (activeMovies.length === 0) {
      grid.innerHTML = `<p class="status">No Indian movies found in this date range.</p>`;
      loadMoreWrapper.style.display = "none";
      return;
    }

    resetAndRender();

  } catch (error) {
    if (thisRequestId !== dateRequestId) return;
    grid.innerHTML = `<p class="status error">Failed to load movies for this date range.</p>`;
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
  applyDateFilter();
});

fromInput.addEventListener("change", applyDateFilter);
toInput.addEventListener("change", applyDateFilter);

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "Movies";

  const defaultRadio = document.querySelector(`#${currentSort}`);
  if (defaultRadio) defaultRadio.checked = true;

  grid.innerHTML = `<p class="status">Loading ${CATEGORY_TITLES[category] || "movies"}...</p>`;

  try {
    allMovies = await buildIndianMoviesByCategoryPool(category);
    activeMovies = allMovies;

    if (allMovies.length === 0) {
      grid.innerHTML = `<p class="status">No Indian movies found for this category right now.</p>`;
      loadMoreWrapper.style.display = "none";
      return;
    }

    resetAndRender();

  } catch (error) {
    console.error("Movie pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
    loadMoreWrapper.style.display = "none";
  }
}

init();