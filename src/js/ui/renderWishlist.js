// src/js/ui/renderWishlist.js

import { IMAGE_BASE_URL } from "../config.js";
import { removeFromWishlist } from "../utils/storage.js";

export function renderWishlistGrid(movies, container, onRemove) {
  if (movies.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty">
        <p>Your wishlist is empty.</p>
        <a href="index.html" class="btn-discover">Discover Movies</a>
      </div>
    `;
    return;
  }

  const html = movies
    .map((movie) => {
      const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";
      const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

      return `
        <div class="wishlist-card" data-id="${movie.id}">
          <button class="wishlist-remove-btn" data-id="${movie.id}">✕</button>
          <a href="movie-details.html?id=${movie.id}">
            <img src="${poster}" alt="${movie.title}" />
          </a>
          <div class="wishlist-card-info">
            <a href="movie-details.html?id=${movie.id}" class="wishlist-card-title">${movie.title}</a>
            <p class="wishlist-card-meta">⭐ ${movie.vote_average.toFixed(1)} · ${year}</p>
          </div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = html;

  container.querySelectorAll(".wishlist-remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      removeFromWishlist(btn.dataset.id);
      onRemove();
    });
  });
}

export function populateGenreFilter(movies, selectEl) {
  const allGenres = new Set();
  movies.forEach((movie) => movie.genres.forEach((genre) => allGenres.add(genre)));

  const options = Array.from(allGenres)
    .sort()
    .map((genre) => `<option value="${genre}">${genre}</option>`)
    .join("");

  selectEl.innerHTML = `<option value="all">All Genres</option>${options}`;
}

export function sortMovies(movies, sortBy) {
  const sorted = [...movies];

  switch (sortBy) {
    case "rating":
      return sorted.sort((a, b) => b.vote_average - a.vote_average);
    case "title":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "year":
      return sorted.sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    default:
      return movies;
  }
}

export function filterMoviesByGenre(movies, genre) {
  if (genre === "all") return movies;
  return movies.filter((movie) => movie.genres.includes(genre));
}