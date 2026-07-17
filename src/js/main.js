// src/js/main.js

import { fetchTrendingMovies } from "./api.js";
import { renderMovieList } from "./ui/renderMovies.js";

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

loadTrendingMovies();