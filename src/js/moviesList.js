// src/js/moviesList.js

import { loadHeader } from "./utils/loadHeader.js";
import { fetchMoviesByCategory } from "./api.js";
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

const params = new URLSearchParams(window.location.search);
const category = params.get("category") || "popular";

const titleEl = document.querySelector(".list-title");
const grid = document.querySelector(".movie-grid-full");
const loadMoreBtn = document.querySelector(".btn-load-more");
const loadMoreWrapper = document.querySelector(".load-more-wrapper");

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadPage(page, isFirstLoad = false) {
  if (isLoading) return;
  isLoading = true;

  if (isFirstLoad) {
    grid.innerHTML = `<p class="status">Loading movies...</p>`;
  } else {
    loadMoreBtn.textContent = "Loading...";
    loadMoreBtn.disabled = true;
  }

  try {
    const data = await fetchMoviesByCategory(category, page);
    totalPages = data.totalPages;

    if (isFirstLoad) grid.innerHTML = "";

    data.results.forEach((movie) => {
      grid.appendChild(renderMovieCard(movie));
    });

    currentPage = page;
    updateLoadMoreVisibility();

  } catch (error) {
    if (isFirstLoad) {
      grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
    }
  } finally {
    isLoading = false;
    loadMoreBtn.textContent = "Load More";
    loadMoreBtn.disabled = false;
  }
}

function updateLoadMoreVisibility() {
  loadMoreWrapper.style.display = currentPage >= totalPages ? "none" : "flex";
}

loadMoreBtn.addEventListener("click", () => {
  loadPage(currentPage + 1);
});

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "Movies";
  await loadPage(1, true);
}

init();