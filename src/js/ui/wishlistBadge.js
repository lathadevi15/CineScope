// src/js/ui/wishlistBadge.js

import { getWishlist } from "../utils/storage.js";

export function updateWishlistBadge() {
  const badge = document.querySelector(".wishlist-count");
  if (!badge) return;

  const count = getWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-block" : "none";
}