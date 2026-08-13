// src/js/details.js

import { fetchMovieDetails } from "./api.js";
import { renderMovieDetailsPage } from "./ui/renderDetails.js";
import { initSearch } from "./ui/search.js";

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");
const detailsContainer = document.querySelector(".details-container");

async function loadMovieDetails() {
  if (!movieId) {
    detailsContainer.innerHTML = `<p class="status error">No movie selected.</p>`;
    return;
  }
  detailsContainer.innerHTML = `<p class="status">Loading movie details...</p>`;
  try {
    const movie = await fetchMovieDetails(movieId);
    renderMovieDetailsPage(movie, detailsContainer);
  } catch (error) {
    detailsContainer.innerHTML = `<p class="status error">Failed to load movie details.</p>`;
  }
}

initSearch();
loadMovieDetails();