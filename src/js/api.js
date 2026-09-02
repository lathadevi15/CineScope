// src/js/api.js

import { API_KEY, BASE_URL } from "./config.js";

// Shared helper: any endpoint that returns { results: [...] }
async function fetchList(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Failed to fetch movie list:", error);
    throw error;
  }
  
}


const CATEGORY_LANGUAGES = ["te", "hi", "ta", "kn", "ml"];

function buildCategoryDiscoverUrl(category, lang, page) {
  const base = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${lang}&page=${page}`;
  const today = new Date().toISOString().slice(0, 10);
  const sixWeeksAgo = new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  switch (category) {
    case "popular":
      return `${base}&sort_by=popularity.desc`;

    case "trending":
      // TMDB's real trending algorithm isn't language-filterable, so we
      // approximate it as recently-released Indian movies by popularity.
      return `${base}&sort_by=popularity.desc&primary_release_date.gte=${sixWeeksAgo}&primary_release_date.lte=${today}`;

    case "top_rated":
      return `${base}&sort_by=vote_average.desc&vote_count.gte=100`;

    case "now_playing":
      return `${base}&sort_by=popularity.desc&primary_release_date.gte=${sixWeeksAgo}&primary_release_date.lte=${today}&with_release_type=2|3`;

    case "upcoming":
      return `${base}&sort_by=popularity.desc&primary_release_date.gte=${today}`;

    default:
      return `${base}&sort_by=popularity.desc`;
  }
}

export async function buildIndianMoviesByCategoryPool(category) {
  const requests = CATEGORY_LANGUAGES.flatMap((lang) =>
    [1, 2].map((page) =>
      fetch(buildCategoryDiscoverUrl(category, lang, page))
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => data.results)
        .catch(() => [])
    )
  );

  const resultGroups = await Promise.all(requests);
  const merged = resultGroups.flat();

  const uniqueMap = new Map();
  merged.forEach((movie) => {
    if (!uniqueMap.has(movie.id)) {
      uniqueMap.set(movie.id, movie);
    }
  });

  return Array.from(uniqueMap.values());
}
export async function fetchTrendingMovies() {
  return fetchList(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
}

export async function fetchTopRatedMovies() {
  return fetchList(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
}

export async function fetchUpcomingMovies() {
  return fetchList(`${BASE_URL}/movie/upcoming?api_key=${API_KEY}`);
}

export async function discoverMoviesByLanguage(languageCode) {
  return fetchList(
    `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&with_original_language=${languageCode}`
  );
}

function buildIndianTVUrl(category, page) {
  const base = `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_origin_country=IN&page=${page}`;

  switch (category) {
    case "popular":
      return `${base}&sort_by=popularity.desc`;
    case "top_rated":
      return `${base}&sort_by=vote_average.desc&vote_count.gte=50`;
    case "on_tv":
      return `${base}&sort_by=popularity.desc&with_status=0`;
    default:
      return null;
  }
}

export async function fetchTVByCategory(category, page = 1) {
  // Airing Today has no country filter on TMDB's side, so we fetch the
  // global list and filter down to Indian-origin shows ourselves.
  if (category === "airing_today") {
    const url = `${BASE_URL}/tv/airing_today?api_key=${API_KEY}&page=${page}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
      const data = await response.json();

      const indianOnly = data.results.filter(
        (show) => show.origin_country && show.origin_country.includes("IN")
      );

      return {
        results: indianOnly,
        page: data.page,
        totalPages: data.total_pages
      };
    } catch (error) {
      console.error("Failed to fetch airing today TV shows:", error);
      throw error;
    }
  }

  // Popular, Top Rated, On TV — TMDB filters these by origin country for us.
  const url = buildIndianTVUrl(category, page);
  if (!url) throw new Error(`Unknown TV category: ${category}`);

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results,
      page: data.page,
      totalPages: data.total_pages
    };
  } catch (error) {
    console.error(`Failed to fetch ${category} TV shows:`, error);
    throw error;
  }
}

export async function fetchTVDetails(tvId) {
  const url = `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch TV details:", error);
    throw error;
  }
}

export async function searchMovies(query) {
  return fetchList(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
}

// Single-item fetches (unchanged — different response shape, so they stay separate)

export async function fetchMovieDetails(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,similar`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch movie details:", error);
    throw error;
  }
}

export async function fetchPersonDetails(personId) {
  const url = `${BASE_URL}/person/${personId}?api_key=${API_KEY}&append_to_response=combined_credits,images,external_ids`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch person details:", error);
    throw error;
  }
}

export async function discoverPopularByLanguage(languageCode) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&with_original_language=${languageCode}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    return data.results[0] || null;
  } catch (error) {
    console.error(`Failed to discover movies for language ${languageCode}:`, error);
    throw error;
  }
}

export async function fetchPopularTVShow() {
  const url = `${BASE_URL}/tv/popular?api_key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();
    return data.results[0] || null;
  } catch (error) {
    console.error("Failed to fetch popular TV show:", error);
    throw error;
  }
}

export async function fetchMovieBasic(movieId) {
  const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch movie basic details:", error);
    throw error;
  }
}

export async function fetchTVBasic(tvId) {
  const url = `${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch TV basic details:", error);
    throw error;
  }
}





const INDIAN_LANGUAGES_FOR_PEOPLE = ["te", "hi", "ta", "kn", "ml"];

async function fetchIndianTitlePool() {
  const moviePromises = INDIAN_LANGUAGES_FOR_PEOPLE.map((lang) =>
    fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&with_original_language=${lang}&page=1`)
      .then((res) => (res.ok ? res.json() : { results: [] }))
      .then((data) => data.results.slice(0, 8).map((m) => ({ id: m.id, type: "movie" })))
      .catch(() => [])
  );

  const tvPromise = fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&with_origin_country=IN&page=1`)
    .then((res) => (res.ok ? res.json() : { results: [] }))
    .then((data) => data.results.slice(0, 10).map((t) => ({ id: t.id, type: "tv" })))
    .catch(() => []);

  const movieGroups = await Promise.all(moviePromises);
  const tvGroup = await tvPromise;

  return [...movieGroups.flat(), ...tvGroup];
}

async function fetchTitleCredits(titleRef) {
  const endpoint = titleRef.type === "movie" ? "movie" : "tv";
  const url = `${BASE_URL}/${endpoint}/${titleRef.id}/credits?api_key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return { cast: [], crew: [] };
    return await response.json();
  } catch {
    return { cast: [], crew: [] };
  }
}

export async function buildIndianPeoplePool() {
  const titlePool = await fetchIndianTitlePool();
  const creditsList = await Promise.all(titlePool.map(fetchTitleCredits));

  const peopleMap = new Map();

  creditsList.forEach((credits) => {
    (credits.cast || []).slice(0, 8).forEach((actor) => {
      if (!peopleMap.has(actor.id)) {
        peopleMap.set(actor.id, {
          id: actor.id,
          name: actor.name,
          profile_path: actor.profile_path,
          gender: actor.gender,
          popularity: actor.popularity || 0,
          roles: new Set(["Acting"])
        });
      } else {
        peopleMap.get(actor.id).roles.add("Acting");
      }
    });

    (credits.crew || []).forEach((member) => {
      const isDirector = member.job === "Director";
      const isSound = member.department === "Sound";
      if (!isDirector && !isSound) return;

      const role = isDirector ? "Directing" : "Sound";

      if (!peopleMap.has(member.id)) {
        peopleMap.set(member.id, {
          id: member.id,
          name: member.name,
          profile_path: member.profile_path,
          gender: member.gender,
          popularity: member.popularity || 0,
          roles: new Set([role])
        });
      } else {
        peopleMap.get(member.id).roles.add(role);
      }
    });
  });

  return Array.from(peopleMap.values()).sort((a, b) => b.popularity - a.popularity);
}

export function filterPeoplePool(pool, category) {
  switch (category) {
    case "actors":
      return pool.filter((p) => p.roles.has("Acting") && p.gender === 2);
    case "actresses":
      return pool.filter((p) => p.roles.has("Acting") && p.gender === 1);
    case "directors":
      return pool.filter((p) => p.roles.has("Directing"));
    case "composers":
      return pool.filter((p) => p.roles.has("Sound"));
    case "popular":
    default:
      return pool;
  }
}

const GENRE_LANGUAGES = ["te", "hi", "ta", "kn", "ml"];

export async function buildIndianMoviesByGenrePool(genreId) {
  // Two pages per language, across 5 languages = 10 concurrent requests.
  // No single TMDB call supports "any of these 5 languages" at once,
  // so we fetch them separately and merge — same pattern used for the People pool.
  const requests = GENRE_LANGUAGES.flatMap((lang) =>
    [1, 2].map((page) =>
      fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&with_original_language=${lang}&sort_by=popularity.desc&page=${page}`)
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data) => data.results)
        .catch(() => [])
    )
  );

  const resultGroups = await Promise.all(requests);
  const merged = resultGroups.flat();

  const uniqueMap = new Map();
  merged.forEach((movie) => {
    if (!uniqueMap.has(movie.id)) {
      uniqueMap.set(movie.id, movie);
    }
  });

  return Array.from(uniqueMap.values()).sort((a, b) => b.popularity - a.popularity);
}

export async function fetchMoviesByLanguage(languageCode, page = 1) {
  const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${languageCode}&sort_by=popularity.desc&page=${page}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`TMDB API error: ${response.status}`);
    const data = await response.json();

    return {
      results: data.results,
      page: data.page,
      totalPages: data.total_pages
    };
  } catch (error) {
    console.error(`Failed to fetch ${languageCode} movies:`, error);
    throw error;
  }
}