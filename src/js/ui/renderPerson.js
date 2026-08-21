// src/js/ui/renderPerson.js

import { PROFILE_BASE_URL, IMAGE_BASE_URL } from "../config.js";

const LARGE_PROFILE_URL = "https://image.tmdb.org/t/p/w500";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function calcAge(birthday, deathday) {
  if (!birthday) return null;
  const end = deathday ? new Date(deathday) : new Date();
  const start = new Date(birthday);
  let age = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < start.getDate())) {
    age--;
  }
  return age;
}

function buildSocialLinks(externalIds) {
  const links = [];

  if (externalIds.instagram_id) {
    links.push({ icon: "📷", label: "Instagram", url: `https://instagram.com/${externalIds.instagram_id}` });
  }
  if (externalIds.twitter_id) {
    links.push({ icon: "🐦", label: "Twitter", url: `https://twitter.com/${externalIds.twitter_id}` });
  }
  if (externalIds.facebook_id) {
    links.push({ icon: "👍", label: "Facebook", url: `https://facebook.com/${externalIds.facebook_id}` });
  }
  if (externalIds.tiktok_id) {
    links.push({ icon: "🎵", label: "TikTok", url: `https://tiktok.com/@${externalIds.tiktok_id}` });
  }

  return links;
}

export function renderPersonPage(person, container) {
  const photoUrl = person.profile_path
    ? `${LARGE_PROFILE_URL}${person.profile_path}`
    : "https://via.placeholder.com/400x600?text=No+Photo";

  const age = calcAge(person.birthday, person.deathday);
  const birthDate = formatDate(person.birthday);

  const metaParts = [];
  if (person.birthday) {
    metaParts.push(`${person.birthday}${age !== null ? ` (${age} years old)` : ""}`);
  }
  if (person.place_of_birth) {
    metaParts.push(person.place_of_birth);
  }

  const bio = person.biography || "No biography available.";
  const bioIsLong = bio.length > 400;
  const bioShort = bioIsLong ? bio.slice(0, 400).trim() + "..." : bio;

  const socialLinks = buildSocialLinks(person.external_ids || {});
  const socialHtml = socialLinks
    .map((link) => `<a href="${link.url}" target="_blank" rel="noopener" class="social-link" title="${link.label}">${link.icon}</a>`)
    .join("");

  // Personal Info — only fields TMDB actually provides
  const infoRows = [];
  if (person.name) infoRows.push({ label: "Full Name", value: person.name });
  if (birthDate) infoRows.push({ label: "Birth Date", value: birthDate });
  if (person.place_of_birth) infoRows.push({ label: "Place of Birth", value: person.place_of_birth });
  if (person.known_for_department) infoRows.push({ label: "Known For", value: person.known_for_department });
  if (person.also_known_as && person.also_known_as.length > 0) {
    infoRows.push({ label: "Also Known As", value: person.also_known_as.slice(0, 3).join(", ") });
  }
  if (person.deathday) infoRows.push({ label: "Died", value: formatDate(person.deathday) });

  const infoHtml = infoRows
    .map((row) => `
      <div class="info-row">
        <span class="info-label">${row.label}</span>
        <span class="info-value">${row.value}</span>
      </div>
    `)
    .join("");

  // Known For — top credits by popularity
  const allCredits = person.combined_credits.cast || [];
  const knownFor = [...allCredits]
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 6);

  const knownForHtml = knownFor
    .map((credit) => {
      const title = credit.title || credit.name;
      const year = (credit.release_date || credit.first_air_date || "").slice(0, 4) || "N/A";
      const poster = credit.poster_path
        ? `${IMAGE_BASE_URL}${credit.poster_path}`
        : "https://via.placeholder.com/300x450?text=No+Image";
      const link = credit.media_type === "tv"
        ? "#"
        : `movie-details.html?id=${credit.id}`;

      return `
        <a class="known-for-card" href="${link}">
          <div class="known-for-rating">⭐ ${credit.vote_average ? credit.vote_average.toFixed(1) : "N/A"}</div>
          <img src="${poster}" alt="${title}" />
          <p class="known-for-title">${title}</p>
          <p class="known-for-year">${year}</p>
        </a>
      `;
    })
    .join("");

  // Acting credits — full sorted list
  const sortedCredits = [...allCredits].sort((a, b) => {
    const dateA = a.release_date || a.first_air_date || "";
    const dateB = b.release_date || b.first_air_date || "";
    return dateB.localeCompare(dateA);
  });

  const creditsHtml = renderCreditsList(sortedCredits);

  // Gallery
  const galleryPhotos = (person.images?.profiles || []).slice(0, 6);
  const galleryHtml = galleryPhotos
    .map((img) => `<img src="${PROFILE_BASE_URL}${img.file_path}" alt="${person.name}" />`)
    .join("");

  container.innerHTML = `
    <div class="person-hero">
      <img class="person-photo" src="${photoUrl}" alt="${person.name}" />

      <div class="person-main">
        <span class="person-badge">${(person.known_for_department || "PERSON").toUpperCase()}</span>
        <h1>${person.name}</h1>
        <p class="person-meta">${metaParts.join(" · ")}</p>

        <h2>Biography</h2>
        <p class="person-bio" id="bio-text">${bioIsLong ? bioShort : bio}</p>
        ${bioIsLong ? `<button class="btn-read-more" id="read-more-btn">Read More ▾</button>` : ""}

        ${socialLinks.length > 0 ? `
          <h2>Social Links</h2>
          <div class="social-links">${socialHtml}</div>
        ` : ""}
      </div>

      <aside class="person-info-panel">
        <h3>Personal Info</h3>
        ${infoHtml || `<p class="info-empty">No additional info available.</p>`}
      </aside>
    </div>

    ${knownFor.length > 0 ? `
      <section class="person-section">
        <h2>Known For</h2>
        <div class="known-for-row">${knownForHtml}</div>
      </section>
    ` : ""}

    <div class="person-bottom-grid">
      <section class="person-section">
        <div class="credits-header">
          <h2>Acting Credits</h2>
          <div class="credits-tabs">
            <button class="tab-btn active" data-filter="all">All</button>
            <button class="tab-btn" data-filter="movie">Movies</button>
            <button class="tab-btn" data-filter="tv">TV Shows</button>
          </div>
        </div>
        <div class="credits-list" id="credits-list">${creditsHtml}</div>
      </section>

      ${galleryPhotos.length > 0 ? `
        <section class="person-section">
          <h2>Gallery</h2>
          <div class="gallery-grid">${galleryHtml}</div>
        </section>
      ` : ""}
    </div>
  `;

  setupReadMore(bio, bioIsLong);
  setupCreditsFilter(sortedCredits);
}

function renderCreditsList(credits) {
  if (credits.length === 0) {
    return `<p class="status">No acting credits found.</p>`;
  }

  return credits
    .map((credit) => {
      const title = credit.title || credit.name;
      const character = credit.character || "Unknown role";
      const year = (credit.release_date || credit.first_air_date || "").slice(0, 4) || "N/A";
      const poster = credit.poster_path
        ? `${IMAGE_BASE_URL}${credit.poster_path}`
        : "https://via.placeholder.com/60x90?text=N/A";
      const link = credit.media_type === "tv" ? "#" : `movie-details.html?id=${credit.id}`;

      return `
        <a class="credit-row" href="${link}">
          <img src="${poster}" alt="${title}" />
          <div class="credit-info">
            <p class="credit-title">${title}</p>
            <p class="credit-character">${character}</p>
          </div>
          <span class="credit-year">${year}</span>
          <span class="credit-rating">⭐ ${credit.vote_average ? credit.vote_average.toFixed(1) : "N/A"}</span>
          <span class="credit-arrow">›</span>
        </a>
      `;
    })
    .join("");
}

function setupReadMore(fullBio, bioIsLong) {
  if (!bioIsLong) return;

  const btn = document.querySelector("#read-more-btn");
  const bioText = document.querySelector("#bio-text");
  let expanded = false;

  btn.addEventListener("click", () => {
    expanded = !expanded;
    bioText.textContent = expanded ? fullBio : fullBio.slice(0, 400).trim() + "...";
    btn.textContent = expanded ? "Show Less ▴" : "Read More ▾";
  });
}

function setupCreditsFilter(allCredits) {
  const tabs = document.querySelectorAll(".tab-btn");
  const list = document.querySelector("#credits-list");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const filter = tab.dataset.filter;
      const filtered = filter === "all"
        ? allCredits
        : allCredits.filter((credit) => credit.media_type === filter);

      list.innerHTML = renderCreditsList(filtered);
    });
  });
}