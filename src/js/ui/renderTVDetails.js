// src/js/ui/renderTVDetails.js

import { IMAGE_BASE_URL, BACKDROP_BASE_URL, PROFILE_BASE_URL } from "../config.js";

function formatEpisodeRuntime(runtimes) {
  if (!runtimes || runtimes.length === 0) return "N/A";
  return `${runtimes[0]} min/ep`;
}

function getCreators(createdBy) {
  if (!createdBy || createdBy.length === 0) return "Unknown";
  return createdBy.map((person) => person.name).join(", ");
}

export function renderTVDetailsPage(show, container) {
  const posterUrl = show.poster_path
    ? `${IMAGE_BASE_URL}${show.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const backdropUrl = show.backdrop_path ? `${BACKDROP_BASE_URL}${show.backdrop_path}` : "";
  const year = show.first_air_date ? show.first_air_date.slice(0, 4) : "N/A";
  const genres = show.genres || [];
  const genresHtml = genres.map((genre) => `<span class="genre-pill">${genre.name}</span>`).join("");

  const cast = show.credits?.cast || [];
  const videos = show.videos?.results || [];
  const similarShows = show.similar?.results || [];

  const creators = getCreators(show.created_by);
  const trailer = videos.find((v) => v.type === "Trailer" && v.site === "YouTube");

  const castHtml = cast.length > 0
    ? cast
        .slice(0, 10)
        .map((actor) => {
          const photo = actor.profile_path
            ? `${PROFILE_BASE_URL}${actor.profile_path}`
            : "https://via.placeholder.com/185x185?text=No+Photo";
          return `
            <a class="cast-card" href="person.html?id=${actor.id}">
              <img src="${photo}" alt="${actor.name}" />
              <p class="cast-name">${actor.name}</p>
              <p class="cast-character">${actor.character}</p>
            </a>
          `;
        })
        .join("")
    : `<p class="status">Cast information isn't available yet for this title.</p>`;

  const similarHtml = similarShows.length > 0
    ? similarShows
        .slice(0, 6)
        .map((similarShow) => {
          const similarPoster = similarShow.poster_path
            ? `${IMAGE_BASE_URL}${similarShow.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image";
          const similarYear = similarShow.first_air_date ? similarShow.first_air_date.slice(0, 4) : "N/A";
          return `
            <a class="similar-card" href="tv-details.html?id=${similarShow.id}">
              <img src="${similarPoster}" alt="${similarShow.name}" />
              <p class="similar-title">${similarShow.name}</p>
              <p class="similar-meta">${similarYear} · ⭐ ${similarShow.vote_average ? similarShow.vote_average.toFixed(1) : "N/A"}</p>
            </a>
          `;
        })
        .join("")
    : `<p class="status">No similar TV shows found.</p>`;

  container.innerHTML = `
    <section class="details-hero" style="background-image: url('${backdropUrl}')">
      <div class="details-hero-overlay"></div>
      <div class="details-hero-content">
        <img class="details-poster" src="${posterUrl}" alt="${show.name}" />
        <div class="details-info">
          <h1>${show.name} <span class="details-rating">⭐ ${show.vote_average ? show.vote_average.toFixed(1) : "N/A"}</span></h1>
          <p class="details-meta">${year} · ${show.number_of_seasons || 0} Season${show.number_of_seasons === 1 ? "" : "s"} · ${formatEpisodeRuntime(show.episode_run_time)}</p>
          <div class="genre-list">${genresHtml}</div>
          <p class="details-overview">${show.overview || "No overview available."}</p>

          <div class="details-actions">
            <button class="btn-trailer">▶ Watch Trailer</button>
          </div>

          <div class="details-grid">
            <div><strong>Created by</strong><p>${creators}</p></div>
            <div><strong>Episodes</strong><p>${show.number_of_episodes || "N/A"}</p></div>
            <div><strong>First Air Date</strong><p>${show.first_air_date || "N/A"}</p></div>
            <div><strong>Status</strong><p>${show.status || "N/A"}</p></div>
            <div><strong>Seasons</strong><p>${show.number_of_seasons || "N/A"}</p></div>
            <div><strong>Networks</strong><p>${(show.networks || []).map(n => n.name).join(", ") || "N/A"}</p></div>
          </div>
        </div>
      </div>
    </section>

    <section class="details-section">
      <h2>Cast</h2>
      <div class="cast-row">${castHtml}</div>
    </section>

    <section class="details-section" id="trailer-section">
      <h2>Trailer</h2>
      ${trailer
        ? `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${trailer.key}" title="${show.name} trailer" frameborder="0" allowfullscreen></iframe>`
        : `<p class="status">No trailer available yet.</p>`}
    </section>

    <section class="details-section">
      <h2>Similar TV Shows</h2>
      <div class="similar-row">${similarHtml}</div>
    </section>
  `;

  const trailerBtn = container.querySelector(".btn-trailer");
  if (trailer) {
    trailerBtn.addEventListener("click", () => {
      document.querySelector("#trailer-section").scrollIntoView({ behavior: "smooth" });
    });
  } else {
    trailerBtn.disabled = true;
    trailerBtn.style.opacity = "0.5";
    trailerBtn.style.cursor = "not-allowed";
  }
}