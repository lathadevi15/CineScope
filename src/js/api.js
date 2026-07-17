// src/js/api.js

import { API_KEY, BASE_URL } from "./config.js";

export async function fetchTrendingMovies() {
  const url = `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results;

  } catch (error) {
    console.error("Failed to fetch trending movies:", error);
    throw error;
  }
}