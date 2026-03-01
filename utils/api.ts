const BASE_URL = 'https://api.themoviedb.org/3';
// Fallback tutorial key, you should replace this with your own inside .env
const API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || '15d2ea6d0dc1d476efbca3eba2b9bbfb';

export const fetchTrendingMovies = async () => {
    const url = `${BASE_URL}/trending/movie/day?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
};

export const fetchTrendingTV = async () => {
    const url = `${BASE_URL}/trending/tv/day?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
};

export const fetchTrendingAll = async () => {
    const url = `${BASE_URL}/trending/all/day?api_key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
};

export const fetchMoviesByMood = async (genreIds: number[]) => {
    const url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreIds.join(',')}&sort_by=popularity.desc`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
};

export const searchMovies = async (query: string) => {
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results || [];
};

export const getMovieDetails = async (movieId: number) => {
    const url = `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
};

export const getImageUrl = (path: string, size: string = 'w500') => {
    if (!path) return 'https://via.placeholder.com/500x750?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
};
