// src/js/peopleList.js

import { loadHeader } from "./utils/loadHeader.js";
import { buildIndianPeoplePool, filterPeoplePool } from "./api.js";
import { renderPersonCard } from "./ui/renderPeople.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const CATEGORY_TITLES = {
  popular: "Popular People",
  actors: "Actors",
  actresses: "Actresses",
  directors: "Directors",
  composers: "Music Composers"
};

const PAGE_SIZE = 20;

const params = new URLSearchParams(window.location.search);
const category = params.get("category") || "popular";

const titleEl = document.querySelector(".list-title");
const grid = document.querySelector(".person-grid");
const loadMoreBtn = document.querySelector(".btn-load-more");
const loadMoreWrapper = document.querySelector(".load-more-wrapper");

let filteredPeople = [];
let shownCount = 0;

function renderNextBatch() {
  const nextBatch = filteredPeople.slice(shownCount, shownCount + PAGE_SIZE);
  nextBatch.forEach((person) => grid.appendChild(renderPersonCard(person)));
  shownCount += nextBatch.length;

  loadMoreWrapper.style.display = shownCount >= filteredPeople.length ? "none" : "flex";
}

loadMoreBtn.addEventListener("click", renderNextBatch);

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();

  titleEl.textContent = CATEGORY_TITLES[category] || "People";
  grid.innerHTML = `<p class="status">Gathering Indian cast &amp; crew — this takes a moment...</p>`;

  try {
    const pool = await buildIndianPeoplePool();
    filteredPeople = filterPeoplePool(pool, category);

    grid.innerHTML = "";

    if (filteredPeople.length === 0) {
      grid.innerHTML = `<p class="status">No matching people found right now.</p>`;
      loadMoreWrapper.style.display = "none";
      return;
    }

    renderNextBatch();

  } catch (error) {
    console.error("People pool failed:", error);
    grid.innerHTML = `<p class="status error">Failed to load people.</p>`;
    loadMoreWrapper.style.display = "none";
  }
}

init();