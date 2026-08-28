// src/js/tvDetails.js

import { loadHeader } from "./utils/loadHeader.js";
import { fetchTVDetails } from "./api.js";
import { renderTVDetailsPage } from "./ui/renderTVDetails.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const params = new URLSearchParams(window.location.search);
const tvId = params.get("id");
const detailsContainer = document.querySelector(".details-container");

async function loadTVDetails() {
  if (!tvId) {
    detailsContainer.innerHTML = `<p class="status error">No TV show selected.</p>`;
    return;
  }
  detailsContainer.innerHTML = `<p class="status">Loading TV show details...</p>`;
  try {
    const show = await fetchTVDetails(tvId);
    renderTVDetailsPage(show, detailsContainer);
  } catch (error) {
    console.error("TV details failed:", error);
    detailsContainer.innerHTML = `<p class="status error">Failed to load TV show details.</p>`;
  }
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();
  loadTVDetails();
}

init();