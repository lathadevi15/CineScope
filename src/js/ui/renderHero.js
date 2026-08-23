// src/js/ui/renderHero.js

import {
  discoverPopularByLanguage,
  fetchPopularTVShow,
  fetchMovieBasic,
  fetchTVBasic
} from "../api.js";
import { BACKDROP_BASE_URL } from "../config.js";

const LANGUAGES = [
  
  { code: "te", label: "Telugu" },
  { code: "en", label: "English" },
  { code: "ta", label: "Tamil" },
  { code: "hi", label: "Hindi" }
];

const AUTOPLAY_DELAY = 5000;
const TRANSITION_MS = 600;

function formatRuntime(minutes) {
  if (!minutes) return null;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

async function buildMovieSlide(languageCode) {
  const basic = await discoverPopularByLanguage(languageCode);
  if (!basic) return null;

  const full = await fetchMovieBasic(basic.id);

  return {
    type: "movie",
    id: full.id,
    backdropUrl: full.backdrop_path ? `${BACKDROP_BASE_URL}${full.backdrop_path}` : "",
    title: full.title,
    tagline: full.tagline || "",
    genre: full.genres[0]?.name || null,
    rating: full.vote_average ? full.vote_average.toFixed(1) : null,
    year: full.release_date ? full.release_date.slice(0, 4) : null,
    runtime: formatRuntime(full.runtime),
    link: `movie-details.html?id=${full.id}`
  };
}

async function buildTVSlide() {
  const basic = await fetchPopularTVShow();
  if (!basic) return null;

  const full = await fetchTVBasic(basic.id);

  return {
    type: "tv",
    id: full.id,
    backdropUrl: full.backdrop_path ? `${BACKDROP_BASE_URL}${full.backdrop_path}` : "",
    title: full.name,
    tagline: full.tagline || "",
    genre: full.genres[0]?.name || null,
    rating: full.vote_average ? full.vote_average.toFixed(1) : null,
    year: full.first_air_date ? full.first_air_date.slice(0, 4) : null,
    runtime: full.episode_run_time?.[0] ? formatRuntime(full.episode_run_time[0]) : null,
    link: "#"
  };
}

export async function initHero(container) {
  container.innerHTML = `<p class="status">Loading trending picks...</p>`;

  try {
    const movieSlides = await Promise.all(
      LANGUAGES.map((lang) => buildMovieSlide(lang.code))
    );
    const tvSlide = await buildTVSlide();

    const slides = [...movieSlides, tvSlide].filter(Boolean);

    if (slides.length === 0) {
      container.innerHTML = `<p class="status error">No trending content available.</p>`;
      return;
    }

    renderCarousel(slides, container);

  } catch (error) {
    container.innerHTML = `<p class="status error">Failed to load banner.</p>`;
  }
}

function slideMarkup(slide) {
  return `
    <div class="hero-slide" style="background-image: url('${slide.backdropUrl}')">
      <div class="hero-overlay"></div>

      <div class="hero-left">
        <span class="hero-badge">📈 Trending Now</span>
        <h1>${slide.tagline || slide.title}</h1>
        <p class="hero-description">Explore the latest blockbusters, timeless classics, and hidden gems all in one place.</p>
        <div class="hero-cta">
          <a href="index.html" class="btn-primary">▶ Explore Movies</a>
          <a href="wishlist.html" class="btn-secondary">🔖 My Watchlist</a>
        </div>
      </div>

      <a class="hero-right" href="${slide.link}">
        <h3>${slide.title}</h3>
        <p class="hero-meta">
          ${slide.rating ? `⭐ ${slide.rating}` : ""}
          ${slide.year ? ` · ${slide.year}` : ""}
          ${slide.runtime ? ` · ${slide.runtime}` : ""}
          ${slide.genre ? ` · ${slide.genre}` : ""}
        </p>
      </a>
    </div>
  `;
}

function renderCarousel(slides, container) {
  const realCount = slides.length;

  // Clone last slide at the front, and first slide at the back.
  // This lets the track keep sliding in one direction forever,
  // instead of snapping backward when it loops.
  const extended = [slides[realCount - 1], ...slides, slides[0]];

  // Start on index 1 — the first REAL slide (index 0 is the cloned last slide).
  let currentIndex = 1;
  let autoplayTimer = null;
  let isJumping = false;

  const slidesHtml = extended.map(slideMarkup).join("");
  const dotsHtml = slides
    .map((_, i) => `<button class="hero-dot ${i === 0 ? "active" : ""}" data-index="${i}"></button>`)
    .join("");

  container.innerHTML = `
    <div class="hero-carousel">
      <div class="hero-track">${slidesHtml}</div>
      <button class="hero-arrow hero-arrow-left" aria-label="Previous slide">‹</button>
      <button class="hero-arrow hero-arrow-right" aria-label="Next slide">›</button>
      <div class="hero-dots">${dotsHtml}</div>
    </div>
  `;

  const track = container.querySelector(".hero-track");
  const dots = container.querySelectorAll(".hero-dot");

  function setTrackPosition(withTransition) {
    track.style.transition = withTransition ? `transform ${TRANSITION_MS}ms ease` : "none";
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function updateDots() {
    // Map the extended index back to a real slide index for the dots.
    const realIndex = (currentIndex - 1 + realCount) % realCount;
    dots.forEach((dot, i) => dot.classList.toggle("active", i === realIndex));
  }

  function goTo(index, withTransition = true) {
    if (isJumping) return;
    currentIndex = index;
    setTrackPosition(withTransition);
    updateDots();
  }

  function nextSlide() {
    goTo(currentIndex + 1);
  }

  function prevSlide() {
    goTo(currentIndex - 1);
  }

  // After a real transition finishes, check if we landed on a clone.
  // If so, silently (no animation) jump to the matching real slide.
  track.addEventListener("transitionend", () => {
    if (currentIndex === extended.length - 1) {
      isJumping = true;
      currentIndex = 1;
      setTrackPosition(false);
      // Force the browser to apply the "no transition" jump before
      // re-enabling transitions on the next frame.
      requestAnimationFrame(() => { isJumping = false; });
    } else if (currentIndex === 0) {
      isJumping = true;
      currentIndex = realCount;
      setTrackPosition(false);
      requestAnimationFrame(() => { isJumping = false; });
    }
  });

  function startAutoplay() {
    autoplayTimer = setInterval(nextSlide, AUTOPLAY_DELAY);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      goTo(Number(dot.dataset.index) + 1);
      stopAutoplay();
      startAutoplay();
    });
  });

  container.querySelector(".hero-arrow-left").addEventListener("click", () => {
    prevSlide();
    stopAutoplay();
    startAutoplay();
  });

  container.querySelector(".hero-arrow-right").addEventListener("click", () => {
    nextSlide();
    stopAutoplay();
    startAutoplay();
  });

  container.addEventListener("mouseenter", stopAutoplay);
  container.addEventListener("mouseleave", startAutoplay);

  // Set initial position with no transition (so it doesn't slide in from off-screen on load).
  setTrackPosition(false);
  startAutoplay();
}