// src/js/person.js

import { loadHeader } from "./utils/loadHeader.js";
import { fetchPersonDetails } from "./api.js";
import { renderPersonPage } from "./ui/renderPerson.js";
import { initSearch } from "./ui/search.js";
import { updateWishlistBadge } from "./ui/wishlistBadge.js";

const params = new URLSearchParams(window.location.search);
const personId = params.get("id");

const personContainer = document.querySelector(".person-container");

async function loadPerson() {
  if (!personId) {
    personContainer.innerHTML = `<p class="status error">No person selected.</p>`;
    return;
  }

  personContainer.innerHTML = `<p class="status">Loading profile...</p>`;

  try {
    const person = await fetchPersonDetails(personId);
    renderPersonPage(person, personContainer);
  } catch (error) {
    personContainer.innerHTML = `<p class="status error">Failed to load profile.</p>`;
  }
}

async function init() {
  await loadHeader();
  initSearch();
  updateWishlistBadge();
  loadPerson();
}

init();