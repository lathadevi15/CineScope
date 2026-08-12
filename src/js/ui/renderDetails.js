// src/js/ui/renderDetails.js

import { IMAGE_BASE_URL, BACKDROP_BASE_URL, PROFILE_BASE_URL } from "../config.js";

function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatCurrency(amount) {
  if (!amount) return "N/A";
  if (amount >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(3)} billion`;
  }
  if (amount >= 1_000_000) {
    return `$${Math.round(amount / 1_000_000)} million`;
  }
  return `$${amount.toLocaleString()}`;
}

function getDirector(crew) {
  const director = crew.find((person) => person.job === "Director");
  return director ? director.name : "Unknown";
}

export function renderMovieDetailsPage(movie, container) {
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : "";

  const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";

  const genresHtml = movie.genres
    .map((genre) => `<span class="genre-pill">${genre.name}</span>`)
    .join("");

  const director = getDirector(movie.credits.crew);

  const trailer = movie.videos.results.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  const castHtml = movie.credits.cast
    .slice(0, 10)
    .map((actor) => {
      const photo = actor.profile_path
        ? `${PROFILE_BASE_URL}${actor.profile_path}`
        : "https://via.placeholder.com/185x185?text=No+Photo";

      return `
        <div class="cast-card">
          <img src="${photo}" alt="${actor.name}" />
          <p class="cast-name">${actor.name}</p>
          <p class="cast-character">${actor.character}</p>
        </div>
      `;
    })
    .join("");

  const similarHtml = movie.similar.results
    .slice(0, 6)
    .map((similarMovie) => {
      const similarPoster = similarMovie.poster_path
        ? `${IMAGE_BASE_URL}${similarMovie.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";
      const similarYear = similarMovie.release_date
        ? similarMovie.release_date.slice(0, 4)
        : "N/A";

      return `
        <a class="similar-card" href="movie-details.html?id=${similarMovie.id}">
          <img src="${similarPoster}" alt="${similarMovie.title}" />
          <p class="similar-title">${similarMovie.title}</p>
          <p class="similar-meta">${similarYear} · ⭐ ${similarMovie.vote_average.toFixed(1)}</p>
        </a>
      `;
    })
    .join("");

  container.innerHTML = `
    <section class="details-hero" style="background-image: url('${backdropUrl}')">
      <div class="details-hero-overlay"></div>
      <div class="details-hero-content">
        <img class="details-poster" src="${posterUrl}" alt="${movie.title}" />

        <div class="details-info">
          <h1>${movie.title} <span class="details-rating">⭐ ${movie.vote_average.toFixed(1)}</span></h1>
          <p class="details-meta">${year} · ${formatRuntime(movie.runtime)}</p>

          <div class="genre-list">${genresHtml}</div>

          <p class="details-overview">${movie.overview}</p>

          <div class="details-actions">
            <button class="btn-trailer">▶ Watch Trailer</button>
            <button class="btn-watchlist">🔖 Add to Watchlist</button>
          </div>

          <div class="details-grid">
            <div><strong>Directed by</strong><p>${director}</p></div>
            <div><strong>Runtime</strong><p>${formatRuntime(movie.runtime)}</p></div>
            <div><strong>Release Date</strong><p>${movie.release_date || "N/A"}</p></div>
            <div><strong>Status</strong><p>${movie.status}</p></div>
            <div><strong>Budget</strong><p>${formatCurrency(movie.budget)}</p></div>
            <div><strong>Revenue</strong><p>${formatCurrency(movie.revenue)}</p></div>
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
      ${
        trailer
          ? `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${trailer.key}" title="${movie.title} trailer" frameborder="0" allowfullscreen></iframe>`
          : `<p>No trailer available.</p>`
      }
    </section>

    <section class="details-section">
      <h2>Similar Movies</h2>
      <div class="similar-row">${similarHtml}</div>
    </section>
  `;

  container.querySelector(".btn-trailer").addEventListener("click", () => {
    document.querySelector("#trailer-section").scrollIntoView({ behavior: "smooth" });
  });
}