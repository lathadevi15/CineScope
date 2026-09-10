// src/js/tvList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianTVPool, fetchAllLanguages } from "./api.js";
import { renderTVCard } from "./ui/renderTV.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const CATEGORY_TITLES = {
  popular: "Popular TV Shows",
  airing_today: "Airing Today",
  top_rated: "Top Rated TV Shows",
  on_tv: "On TV"
};

const PAGE_SIZE = 20;

const params = new URLSearchParams(window.location.search);
const category = params.get("category") || "popular";

const titleEl = document.querySelector(".list-title");
const grid = document.querySelector(".movie-grid-full");
const loadMoreBtn = document.querySelector(".btn-load-more");
const loadMoreWrapper = document.querySelector(".load-more-wrapper");
const sortForm = document.querySelector(".filters-content form");
const searchAllCheckbox = document.querySelector("#search-all-releases");
const fromInput = document.querySelector("#release-from");
const toInput = document.querySelector("#release-to");
const genreContainer = document.querySelector(".genre-filter");
const languageSelect = document.querySelector("#language-select");
const applyFiltersBtn = document.querySelector("#apply-filters-btn");

let activeShows = [];
let shownCount = 0;
let currentSort = "popularity-descending";
let requestId = 0;
let pendingGenreIds = new Set();

function sortShows(shows, sortBy) {
  const sorted = [...shows];
  switch (sortBy) {
    case "popularity-descending":
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case "popularity-ascending":
      return sorted.sort((a, b) => (a.popularity || 0) - (b.popularity || 0));
    case "rating-descending":
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    case "rating-ascending":
      return sorted.sort((a, b) => (a.vote_average || 0) - (b.vote_average || 0));
    case "release-date-descending":
      return sorted.sort((a, b) => (b.first_air_date || "").localeCompare(a.first_air_date || ""));
    case "release-date-ascending":
      return sorted.sort((a, b) => (a.first_air_date || "").localeCompare(b.first_air_date || ""));
    default:
      return sorted;
  }
}

function renderVisible() {
  const sorted = sortShows(activeShows, currentSort);
  const visible = sorted.slice(0, shownCount);

  grid.innerHTML = visible.length > 0 ? "" : `<p class="status">No TV shows match these filters.</p>`;
  visible.forEach((show) => grid.appendChild(renderTVCard(show)));

  loadMoreWrapper.style.display = shownCount >= sorted.length ? "none" : "flex";
}

function showMore() {
  shownCount += PAGE_SIZE;
  renderVisible();
}

async function fetchAndApply() {
  const thisRequestId = ++requestId;

  const from = searchAllCheckbox.checked ? null : fromInput.value;
  const to = searchAllCheckbox.checked ? null : toInput.value;
  const language = languageSelect.value || null;
  const genreIds = pendingGenreIds.size > 0 ? Array.from(pendingGenreIds) : null;

  grid.innerHTML = `<p class="status">Loading TV shows...</p>`;
  loadMoreWrapper.style.display = "none";

  try {
    const pool = await buildIndianTVPool({ category, genreIds, fromDate: from, toDate: to, language });

    if (thisRequestId !== requestId) return;

    activeShows = pool;
    shownCount = PAGE_SIZE;

    if (activeShows.length === 0) {
      grid.innerHTML = `<p class="status">No TV shows match these filters right now.</p>`;
      return;
    }

    renderVisible();

  } catch (error) {
    if (thisRequestId !== requestId) return;
    console.error("TV pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load TV shows.</p>`;
  }
}

loadMoreBtn.addEventListener("click", showMore);

sortForm.addEventListener("change", (event) => {
  currentSort = event.target.id;
  renderVisible();
});

searchAllCheckbox.addEventListener("change", () => {
  const disabled = searchAllCheckbox.checked;
  fromInput.disabled = disabled;
  toInput.disabled = disabled;
});

genreContainer.addEventListener("click", (event) => {
  const btn = event.target.closest(".genre-btn");
  if (!btn) return;

  const clickedId = btn.dataset.genreId;

  if (pendingGenreIds.has(clickedId)) {
    pendingGenreIds.delete(clickedId);
    btn.classList.remove("active");
  } else {
    pendingGenreIds.add(clickedId);
    btn.classList.add("active");
  }
});

applyFiltersBtn.addEventListener("click", fetchAndApply);

async function populateLanguageDropdown() {
  try {
    const languages = await fetchAllLanguages();
    const optionsHtml = languages
      .map((lang) => `<option value="${lang.iso_639_1}">${lang.english_name}</option>`)
      .join("");
    languageSelect.insertAdjacentHTML("beforeend", optionsHtml);
  } catch (error) {
    console.error("Language dropdown failed to populate:", error);
  }
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "TV Shows";

  const defaultRadio = document.querySelector(`#${currentSort}`);
  if (defaultRadio) defaultRadio.checked = true;

  populateLanguageDropdown();
  await fetchAndApply();
}

init();