// src/js/wishlist.js

import { getWishlist, clearWishlist } from "./utils/storage.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";
import {
  renderWishlistGrid,
  populateGenreFilter,
  sortMovies,
  filterMoviesByGenre
} from "./ui/renderWishlist.js";

const wishlistGrid = document.querySelector(".wishlist-grid");
const wishlistFooter = document.querySelector(".wishlist-footer");
const countPill = document.querySelector(".wishlist-count-pill");
const sortSelect = document.querySelector(".sort-select");
const filterSelect = document.querySelector(".filter-select");
const clearBtn = document.querySelector(".btn-clear-wishlist");

function renderPage() {
  const allMovies = getWishlist();

  countPill.textContent = allMovies.length;
  populateGenreFilter(allMovies, filterSelect);

  const filtered = filterMoviesByGenre(allMovies, filterSelect.value);
  const sorted = sortMovies(filtered, sortSelect.value);

  renderWishlistGrid(sorted, wishlistGrid, renderPage);
  renderFooter(allMovies.length);
  updateWishlistBadge();
}

function renderFooter(count) {
  if (count === 0) {
    wishlistFooter.innerHTML = "";
    return;
  }

  wishlistFooter.innerHTML = `
    <p>${count} movie${count === 1 ? "" : "s"} in your wishlist — keep exploring and add more!</p>
    <a href="index.html" class="btn-discover">Discover More Movies</a>
  `;
}

sortSelect.addEventListener("change", renderPage);
filterSelect.addEventListener("change", renderPage);

clearBtn.addEventListener("click", () => {
  const confirmed = confirm("Remove all movies from your wishlist?");
  if (confirmed) {
    clearWishlist();
    renderPage();
  }
});

initSearch();
renderPage();