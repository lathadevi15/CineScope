// src/js/ui/search.js

import { searchMovies } from "../api.js";
import { debounce } from "../utils/debounce.js";
import { IMAGE_BASE_URL } from "../config.js";

let searchInput;
let searchResults;

export function initSearch() {
  searchInput = document.querySelector(".search-box input");
  searchResults = document.querySelector(".search-results");

  if (!searchInput || !searchResults) {
    console.error("Search elements not found in DOM.");
    return;
  }

  const debouncedSearch = debounce(handleInput, 400);
  searchInput.addEventListener("input", debouncedSearch);

  document.addEventListener("click", (event) => {
    const clickedInside = event.target.closest(".search-box") || event.target.closest(".search-results");
    if (!clickedInside) {
      hideResults();
    }
  });
}

async function handleInput(event) {
  const query = event.target.value.trim();

  if (query.length < 2) {
    hideResults();
    return;
  }

  searchResults.innerHTML = `<p class="search-status">Searching...</p>`;
  showResults();

  try {
    const movies = await searchMovies(query);
    renderResults(movies);
  } catch (error) {
    searchResults.innerHTML = `<p class="search-status error">Something went wrong.</p>`;
  }
}

function renderResults(movies) {
  if (movies.length === 0) {
    searchResults.innerHTML = `<p class="search-status">No movies found.</p>`;
    return;
  }

  const html = movies
    .slice(0, 8)
    .map((movie) => {
      const poster = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : "https://via.placeholder.com/92x138?text=No+Image";
      const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

      return `
        <a class="search-result-item" href="movie-details.html?id=${movie.id}">
          <img src="${poster}" alt="${movie.title}" />
          <div class="search-result-info">
            <p class="search-result-title">${movie.title}</p>
            <p class="search-result-year">${year}</p>
          </div>
        </a>
      `;
    })
    .join("");

  searchResults.innerHTML = html;
}

function showResults() {
  searchResults.classList.add("active");
}

function hideResults() {
  searchResults.classList.remove("active");
  searchResults.innerHTML = "";
}