// src/js/ui/renderMovies.js

import { IMAGE_BASE_URL } from "../config.js";

export function renderMovieCard(movie) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  card.innerHTML = `
    <img src="${posterUrl}" alt="${movie.title}" />
    <h3>${movie.title}</h3>
    <p>⭐ ${movie.vote_average.toFixed(1)}</p>
  `;

  return card;
}

export function renderMovieList(movies, container) {
  container.innerHTML = "";

  movies.forEach((movie) => {
    const card = renderMovieCard(movie);
    container.appendChild(card);
  });
}