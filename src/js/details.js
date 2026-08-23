// src/js/details.js

import { loadHeader } from "./utils/loadHeader.js";
import { fetchMovieDetails } from "./api.js";
import { renderMovieDetailsPage } from "./ui/renderDetails.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

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
  console.log("Movie data received:", movie);
  console.log("Keys present:", Object.keys(movie));
  renderMovieDetailsPage(movie, detailsContainer);
} catch (error) {
  console.error("Movie details failed:", error);
  detailsContainer.innerHTML = `<p class="status error">Failed to load movie details.</p>`;
}
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();
  loadMovieDetails();
}

init();