// src/js/main.js

import { loadHeader } from "./utils/loadHeader.js";
import {
  fetchTrendingMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  discoverMoviesByLanguage
} from "./api.js";
import { renderMovieList } from "./ui/renderMovies.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";
import { initHero } from "./ui/renderHero.js";
import { initScrollRow } from "./utils/scrollRow.js";
import { createRowSectionHTML, loadMovieRow } from "./ui/renderMovieRow.js";
import { getWishlist } from "./utils/storage.js";

const movieGrid = document.querySelector(".movie-grid");
const heroSection = document.querySelector(".hero");
const movieRowWrapper = document.querySelector(".movie-row-wrapper");
const rowsContainer = document.querySelector(".movie-rows-container");

const ADDITIONAL_ROWS = [
  { id: "top-rated", title: "Top Rated ", fetchFn: fetchTopRatedMovies },
  { id: "telugu", title: "Telugu ", fetchFn: () => discoverMoviesByLanguage("te") },
  { id: "tamil", title: "Tamil ", fetchFn: () => discoverMoviesByLanguage("ta") },
  { id: "hindi", title: "Hindi ", fetchFn: () => discoverMoviesByLanguage("hi") },
  { id: "malayalam", title: "Malayalam ", fetchFn: () => discoverMoviesByLanguage("ml") },
  { id: "kannada", title: "Kannada ", fetchFn: () => discoverMoviesByLanguage("kn") },
  { id: "upcoming", title: "Upcoming ", fetchFn: fetchUpcomingMovies },
  {
    id: "watchlist",
    title: "Your Watchlist",
    fetchFn: async () => getWishlist(),
    emptyMessage: "Your watchlist is empty. Start adding movies you want to watch!"
  }
];

async function loadTrendingMovies() {
  movieGrid.innerHTML = `<p class="status">Loading movies...</p>`;
  try {
    const movies = await fetchTrendingMovies();
    renderMovieList(movies, movieGrid);
  } catch (error) {
    movieGrid.innerHTML = `<p class="status error">Something went wrong. Please try again later.</p>`;
  }
}

function renderAdditionalRows() {
  rowsContainer.innerHTML = ADDITIONAL_ROWS
    .map((row) => createRowSectionHTML(row.id, row.title))
    .join("");

  ADDITIONAL_ROWS.forEach((row) => loadMovieRow(row));
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();
  initHero(heroSection);
  await loadTrendingMovies();
  initScrollRow(movieRowWrapper, ".movie-grid");
  renderAdditionalRows();
}

init();