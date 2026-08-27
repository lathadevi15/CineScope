// src/js/tvList.js

import { loadHeader } from "./utils/loadHeader.js";
import { fetchTVByCategory } from "./api.js";
import { renderTVCard } from "./ui/renderTV.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const CATEGORY_TITLES = {
  popular: "Popular TV Shows",
  airing_today: "Airing Today",
  top_rated: "Top Rated TV Shows",
  on_tv: "On TV"
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
    grid.innerHTML = `<p class="status">Loading TV shows...</p>`;
  } else {
    loadMoreBtn.textContent = "Loading...";
    loadMoreBtn.disabled = true;
  }

  try {
    const data = await fetchTVByCategory(category, page);
    totalPages = data.totalPages;

    if (isFirstLoad) grid.innerHTML = "";

    if (isFirstLoad && data.results.length === 0) {
      grid.innerHTML = `<p class="status">No Indian TV shows found for this category right now.</p>`;
    } else {
      data.results.forEach((show) => {
        grid.appendChild(renderTVCard(show));
      });
    }

    currentPage = page;
    updateLoadMoreVisibility();

  } catch (error) {
    if (isFirstLoad) {
      grid.innerHTML = `<p class="status error">Failed to load TV shows.</p>`;
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

  titleEl.textContent = CATEGORY_TITLES[category] || "TV Shows";
  await loadPage(1, true);
}

init();