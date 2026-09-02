// src/js/moviesList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianMoviesByCategoryPool } from "./api.js";
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

let allMovies = [];   // the full Indian-language pool for this category
let shownCount = 0;
let currentSort = "popularity-descending";

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
  const sorted = sortMovies(allMovies, currentSort);
  const visible = sorted.slice(0, shownCount);

  grid.innerHTML = "";
  visible.forEach((movie) => grid.appendChild(renderMovieCard(movie)));

  loadMoreWrapper.style.display = shownCount >= sorted.length ? "none" : "flex";
}

function showMore() {
  shownCount += PAGE_SIZE;
  renderVisible();
}

loadMoreBtn.addEventListener("click", showMore);

sortForm.addEventListener("change", (event) => {
  currentSort = event.target.id;
  renderVisible(); // re-sort what's already loaded — no new fetch needed
});

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

    if (allMovies.length === 0) {
      grid.innerHTML = `<p class="status">No Indian movies found for this category right now.</p>`;
      loadMoreWrapper.style.display = "none";
      return;
    }

    shownCount = PAGE_SIZE;
    renderVisible();

  } catch (error) {
    console.error("Movie pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
    loadMoreWrapper.style.display = "none";
  }
}

init();