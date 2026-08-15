// src/js/utils/storage.js

const STORAGE_KEY = "cinescope_wishlist";

export function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error("Failed to read wishlist:", error);
    return [];
  }
}

export function isInWishlist(movieId) {
  const wishlist = getWishlist();
  return wishlist.some((movie) => movie.id === Number(movieId));
}

export function addToWishlist(movie) {
  const wishlist = getWishlist();

  if (isInWishlist(movie.id)) return;

  wishlist.push(movie);
  saveWishlist(wishlist);
}

export function removeFromWishlist(movieId) {
  const wishlist = getWishlist();
  const updated = wishlist.filter((movie) => movie.id !== Number(movieId));
  saveWishlist(updated);
}

export function clearWishlist() {
  saveWishlist([]);
}

function saveWishlist(wishlist) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
}