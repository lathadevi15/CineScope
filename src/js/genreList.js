// src/js/genreList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianMoviesByGenrePool } from "./api.js";
import { renderMovieCard } from "./ui/renderMovies.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const PAGE_SIZE = 20;

const params = new URLSearchParams(window.location.search);
const genreId = params.get("id");
const genreName = params.get("name") || "Genre";

const titleEl = document.querySelector(".list-title");
const grid = document.querySelector(".movie-grid-full");
const loadMoreBtn = document.querySelector(".btn-load-more");
const loadMoreWrapper = document.querySelector(".load-more-wrapper");

let moviePool = [];
let shownCount = 0;

function renderNextBatch() {
  const nextBatch = moviePool.slice(shownCount, shownCount + PAGE_SIZE);
  nextBatch.forEach((movie) => grid.appendChild(renderMovieCard(movie)));
  shownCount += nextBatch.length;

  loadMoreWrapper.style.display = shownCount >= moviePool.length ? "none" : "flex";
}

loadMoreBtn.addEventListener("click", renderNextBatch);

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = `${genreName} Movies`;

  if (!genreId) {
    grid.innerHTML = `<p class="status error">No genre selected.</p>`;
    loadMoreWrapper.style.display = "none";
    return;
  }

  grid.innerHTML = `<p class="status">Loading ${genreName} movies...</p>`;

  try {
    moviePool = await buildIndianMoviesByGenrePool(genreId);
    grid.innerHTML = "";

    if (moviePool.length === 0) {
      grid.innerHTML = `<p class="status">No Indian ${genreName} movies found right now.</p>`;
      loadMoreWrapper.style.display = "none";
      return;
    }

    renderNextBatch();

  } catch (error) {
    console.error("Genre pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
    loadMoreWrapper.style.display = "none";
  }
}

init();