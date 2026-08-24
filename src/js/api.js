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


const CATEGORY_ENDPOINTS = {
  popular: `${BASE_URL}/movie/popular`,
  trending: `${BASE_URL}/trending/movie/week`,
  top_rated: `${BASE_URL}/movie/top_rated`,
  now_playing: `${BASE_URL}/movie/now_playing`,
  upcoming: `${BASE_URL}/movie/upcoming`
};

export async function fetchMoviesByCategory(category, page = 1) {
  const endpoint = CATEGORY_ENDPOINTS[category];
  if (!endpoint) throw new Error(`Unknown category: ${category}`);

  const url = `${endpoint}?api_key=${API_KEY}&page=${page}`;

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
    console.error(`Failed to fetch ${category} movies:`, error);
    throw error;
  }
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