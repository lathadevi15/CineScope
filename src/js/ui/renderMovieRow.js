// src/js/ui/renderMovieRow.js

import { renderMovieCard } from "./renderMovies.js";
import { initScrollRow } from "../utils/scrollRow.js";

export function createRowSectionHTML(id, title) {
  return `
    <section class="movies">
      <h2>${title}</h2>
      <div class="movie-row-wrapper" id="${id}-wrapper">
        <button class="row-arrow row-arrow-left" aria-label="Scroll left">‹</button>
        <div class="movie-grid" id="${id}-grid"></div>
        <button class="row-arrow row-arrow-right" aria-label="Scroll right">›</button>
      </div>
    </section>
  `;
}

export async function loadMovieRow({ id, fetchFn, emptyMessage }) {
  const grid = document.querySelector(`#${id}-grid`);
  const wrapper = document.querySelector(`#${id}-wrapper`);
  if (!grid || !wrapper) return;

  grid.innerHTML = `<p class="status">Loading...</p>`;

  try {
    const movies = await fetchFn();

    if (!movies || movies.length === 0) {
      grid.innerHTML = `<p class="status">${emptyMessage || "Nothing to show right now."}</p>`;
      return;
    }

    grid.innerHTML = "";
    movies.forEach((movie) => {
      grid.appendChild(renderMovieCard(movie));
    });

    initScrollRow(wrapper, ".movie-grid");

  } catch (error) {
    grid.innerHTML = `<p class="status error">Failed to load movies.</p>`;
  }
}