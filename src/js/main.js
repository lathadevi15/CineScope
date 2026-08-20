import { loadHeader } from "./utils/loadHeader.js";
import { fetchTrendingMovies } from "./api.js";
import { renderMovieList } from "./ui/renderMovies.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const movieGrid = document.querySelector(".movie-grid");

async function loadTrendingMovies() {
  movieGrid.innerHTML = `<p class="status">Loading movies...</p>`;
  try {
    const movies = await fetchTrendingMovies();
    renderMovieList(movies, movieGrid);
  } catch (error) {
    movieGrid.innerHTML = `<p class="status error">Something went wrong. Please try again later.</p>`;
  }
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();
  loadTrendingMovies();
}

init();