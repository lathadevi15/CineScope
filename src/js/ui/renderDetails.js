// src/js/ui/renderDetails.js

import { IMAGE_BASE_URL, BACKDROP_BASE_URL, PROFILE_BASE_URL } from "../config.js";
import { addToWishlist, removeFromWishlist, isInWishlist } from "../utils/storage.js";
import { updateWishlistBadge } from "./wishlistBadge.js";

function formatRuntime(minutes) {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatCurrency(amount) {
  if (!amount) return "N/A";
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(3)} billion`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)} million`;
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

  const backdropUrl = movie.backdrop_path ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : "";
  const year = movie.release_date ? movie.release_date.slice(0, 4) : "N/A";
  const genres = movie.genres || [];
  const genresHtml = genres.map((genre) => `<span class="genre-pill">${genre.name}</span>`).join("");

  // Defensive fallbacks: these sub-resources can be missing or incomplete
  // for very new / upcoming titles, even though we requested them via append_to_response.
  const crew = movie.credits?.crew || [];
  const cast = movie.credits?.cast || [];
  const videos = movie.videos?.results || [];
  const similarMovies = movie.similar?.results || [];

  const director = getDirector(crew);
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

  const similarHtml = similarMovies.length > 0
    ? similarMovies
        .slice(0, 6)
        .map((similarMovie) => {
          const similarPoster = similarMovie.poster_path
            ? `${IMAGE_BASE_URL}${similarMovie.poster_path}`
            : "https://via.placeholder.com/500x750?text=No+Image";
          const similarYear = similarMovie.release_date ? similarMovie.release_date.slice(0, 4) : "N/A";
          return `
            <a class="similar-card" href="movie-details.html?id=${similarMovie.id}">
              <img src="${similarPoster}" alt="${similarMovie.title}" />
              <p class="similar-title">${similarMovie.title}</p>
              <p class="similar-meta">${similarYear} · ⭐ ${similarMovie.vote_average ? similarMovie.vote_average.toFixed(1) : "N/A"}</p>
            </a>
          `;
        })
        .join("")
    : `<p class="status">No similar movies found.</p>`;

  container.innerHTML = `
    <section class="details-hero" style="background-image: url('${backdropUrl}')">
      <div class="details-hero-overlay"></div>
      <div class="details-hero-content">
        <img class="details-poster" src="${posterUrl}" alt="${movie.title}" />
        <div class="details-info">
          <h1>${movie.title} <span class="details-rating">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}</span></h1>
          <p class="details-meta">${year} · ${formatRuntime(movie.runtime)}</p>
          <div class="genre-list">${genresHtml}</div>
          <p class="details-overview">${movie.overview || "No overview available."}</p>

          <div class="details-actions">
            <button class="btn-trailer">▶ Watch Trailer</button>
            <button class="btn-watchlist" data-id="${movie.id}">🔖 Add to Watchlist</button>
          </div>

          <div class="details-grid">
            <div><strong>Directed by</strong><p>${director}</p></div>
            <div><strong>Runtime</strong><p>${formatRuntime(movie.runtime)}</p></div>
            <div><strong>Release Date</strong><p>${movie.release_date || "N/A"}</p></div>
            <div><strong>Status</strong><p>${movie.status || "N/A"}</p></div>
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
      ${trailer
        ? `<iframe width="100%" height="450" src="https://www.youtube.com/embed/${trailer.key}" title="${movie.title} trailer" frameborder="0" allowfullscreen></iframe>`
        : `<p class="status">No trailer available yet.</p>`}
    </section>

    <section class="details-section">
      <h2>Similar Movies</h2>
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

  setupWatchlistButton(movie);
}

function setupWatchlistButton(movie) {
  const btn = document.querySelector(".btn-watchlist");

  function refreshButtonState() {
    if (isInWishlist(movie.id)) {
      btn.textContent = "✓ In Watchlist";
      btn.classList.add("active");
    } else {
      btn.textContent = "🔖 Add to Watchlist";
      btn.classList.remove("active");
    }
  }

  refreshButtonState();

  btn.addEventListener("click", () => {
    if (isInWishlist(movie.id)) {
      removeFromWishlist(movie.id);
    } else {
      addToWishlist({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        genres: (movie.genres || []).map((g) => g.name)
      });
    }
    refreshButtonState();
    updateWishlistBadge();
  });
}