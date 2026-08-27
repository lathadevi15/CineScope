// src/js/ui/renderTV.js

import { IMAGE_BASE_URL } from "../config.js";

export function renderTVCard(show) {
  const card = document.createElement("div");
  card.className = "movie-card";

  const posterUrl = show.poster_path
    ? `${IMAGE_BASE_URL}${show.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const year = show.first_air_date ? show.first_air_date.slice(0, 4) : "N/A";

  card.innerHTML = `
    <img src="${posterUrl}" alt="${show.name}" />
    <h3>${show.name}</h3>
    <p>⭐ ${show.vote_average ? show.vote_average.toFixed(1) : "N/A"} · ${year}</p>
  `;

  return card;
}