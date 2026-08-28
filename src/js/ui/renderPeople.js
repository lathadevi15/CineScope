// src/js/ui/renderPeople.js

import { PROFILE_BASE_URL } from "../config.js";

export function renderPersonCard(person) {
  const card = document.createElement("a");
  card.className = "person-card";
  card.href = `person.html?id=${person.id}`;

  const photoUrl = person.profile_path
    ? `${PROFILE_BASE_URL}${person.profile_path}`
    : "https://via.placeholder.com/185x278?text=No+Photo";

  const roleLabel = Array.from(person.roles).join(", ");

  card.innerHTML = `
    <img src="${photoUrl}" alt="${person.name}" />
    <h3>${person.name}</h3>
    <p class="person-department">${roleLabel}</p>
  `;

  return card;
}