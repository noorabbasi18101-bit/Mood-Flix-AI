import { Movie, TMDbResponse, TMDbVideo, MovieCast } from '../types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

// Fallback image when poster is missing
export const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
export const FALLBACK_BACKDROP = 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1280&q=80';

export function getPosterUrl(path: string | null): string {
  if (!path) return FALLBACK_POSTER;
  if (path.startsWith('http')) return path;
  return `${TMDB_IMAGE_BASE}${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return FALLBACK_BACKDROP;
  if (path.startsWith('http')) return path;
  return `${TMDB_BACKDROP_BASE}${path}`;
}

// Fallback high-quality curated movie dataset in case API key is missing or offline
export const FALLBACK_MOVIES: Movie[] = [
  {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to have his criminal history erased as payment for the implantation of another person\'s idea into a target\'s subconscious.',
    poster_path: '/oYuLE1S1S3P22C929S3A37C1S32.jpg', // TMDb real path
    backdrop_path: '/8ZTVqvKDQ8P2D1yS80mX.jpg',
    release_date: '2010-07-15',
    vote_average: 8.4,
    vote_count: 35000,
    genre_ids: [28, 878, 12],
    aiMatchReason: 'Mind-bending psychological thriller that challenges your reality.',
    aiMatchReasonUrdu: 'Agar aap mind-bending aur zahn ko ghumane wali suspense movies pasand karte hain to ye movie perfect hai.',
    matchScore: 98,
    moodTags: ['Mind-bending', 'Intense', 'Sci-Fi'],
  },
  {
    id: 157336,
    title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljv3P8O8OtC2x31iT1e.jpg',
    release_date: '2014-11-05',
    vote_average: 8.4,
    vote_count: 34000,
    genre_ids: [12, 18, 878],
    aiMatchReason: 'Emotional space odyssey about love, survival, and deep cosmic wonder.',
    aiMatchReasonUrdu: 'Agar aap jazbati aur space ki khubsoorat aur gehri kahani pasand karte hain to ye movie zaroor dekhein.',
    matchScore: 96,
    moodTags: ['Cosmic', 'Emotional', 'Epic'],
  },
  {
    id: 278,
    title: 'The Shawshank Redemption',
    overview: 'Imprisoned in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden.',
    poster_path: '/9cqN1311oA8pM2eI197p28S3.jpg',
    backdrop_path: '/kXfqcd22B1qO3A0y.jpg',
    release_date: '1994-09-23',
    vote_average: 8.7,
    vote_count: 26000,
    genre_ids: [18, 80],
    aiMatchReason: 'Uplifting story of hope, friendship, and ultimate resilience against all odds.',
    aiMatchReasonUrdu: 'Agar aap umeed aur hosle se bhari hui ek shandar kahani chahte hain to ye sab se behtareen choice hai.',
    matchScore: 99,
    moodTags: ['Inspiring', 'Hopeful', 'Masterpiece'],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    overview: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
    poster_path: '/qJ2tW6WMUD1M1O3P3g.jpg',
    backdrop_path: '/nMK2A1s.jpg',
    release_date: '2008-07-16',
    vote_average: 8.5,
    vote_count: 32000,
    genre_ids: [18, 28, 80, 53],
    aiMatchReason: 'Dark, gritty action masterpiece with unmatched psychological tension.',
    aiMatchReasonUrdu: 'Gar aap dark, gritty action aur Joker ki zordar acting pasand karte hain to ye movie zabardast hai.',
    matchScore: 97,
    moodTags: ['Dark', 'Action', 'Gritty'],
  },
  {
    id: 496243,
    title: 'Parasite',
    overview: 'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    poster_path: '/7IiT3883aL.jpg',
    backdrop_path: '/hiE4U611.jpg',
    release_date: '2019-05-30',
    vote_average: 8.5,
    vote_count: 17500,
    genre_ids: [35, 53, 18],
    aiMatchReason: 'Shocking social thriller filled with dark humor and unpredictable twists.',
    aiMatchReasonUrdu: 'Agar aap suspense aur ajeeb o ghareeb twists pasand karte hain to Parasite zaroor dekhein.',
    matchScore: 95,
    moodTags: ['Korean', 'Dark Comedy', 'Thriller'],
  },
  {
    id: 129,
    title: 'Spirited Away',
    overview: 'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    poster_path: '/39303328.jpg',
    backdrop_path: '/m43311.jpg',
    release_date: '2001-07-20',
    vote_average: 8.5,
    vote_count: 16000,
    genre_ids: [16, 10751, 14],
    aiMatchReason: 'Magical animation that immerses you in a rich, comforting dream world.',
    aiMatchReasonUrdu: 'Agar aap ek jadui, relaxing aur khubsoorat cartoon dunya mein khona chahte hain to ye perfect hai.',
    matchScore: 94,
    moodTags: ['Magical', 'Relaxing', 'Anime'],
  },
  {
    id: 121,
    title: 'The Lord of the Rings: The Two Towers',
    overview: 'Frodo and Sam continue their journey to Mordor, while Aragorn, Legolas, and Gimli unite with Gondor to fight Sauron\'s army.',
    poster_path: '/5VT17.jpg',
    backdrop_path: '/742211.jpg',
    release_date: '2002-12-18',
    vote_average: 8.4,
    vote_count: 22000,
    genre_ids: [12, 14, 28],
    aiMatchReason: 'Grand fantasy epic filled with heroic battles, honor, and mythical adventure.',
    aiMatchReasonUrdu: 'Agar aap fantasy aur zabardast jangon wali kahani dekhna chahte hain to ye zaroor dekhein.',
    matchScore: 96,
    moodTags: ['Fantasy', 'Epic', 'Heroic'],
  },
  {
    id: 238,
    title: 'The Godfather',
    overview: 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in.',
    poster_path: '/3bhS3.jpg',
    backdrop_path: '/rSP2.jpg',
    release_date: '1972-03-14',
    vote_average: 8.7,
    vote_count: 19000,
    genre_ids: [18, 80],
    aiMatchReason: 'Atmospheric crime cinema defining power, family loyalty, and tragedy.',
    aiMatchReasonUrdu: 'Agar aap crime, khandan aur taqat ki ek classic kahani dekhna chahte hain to Godfather sab se aala hai.',
    matchScore: 98,
    moodTags: ['Classic', 'Crime', 'Dramatic'],
  },
];

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T | null> {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `/api/tmdb?endpoint=${encodeURIComponent(endpoint)}&${query}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`TMDb request failed: ${res.status}`);
    }
    const data = await res.json();
    return data as T;
  } catch (err) {
    console.warn('TMDb fetch error:', err);
    return null;
  }
}

export async function fetchPopularMovies(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbResponse>('/movie/popular', { page: String(page) });
  return data?.results && data.results.length > 0 ? data.results : FALLBACK_MOVIES;
}

export async function fetchTrendingMovies(timeWindow: 'day' | 'week' = 'day'): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbResponse>(`/trending/movie/${timeWindow}`);
  return data?.results && data.results.length > 0 ? data.results : FALLBACK_MOVIES;
}

export async function fetchTopRatedMovies(page = 1): Promise<Movie[]> {
  const data = await tmdbFetch<TMDbResponse>('/movie/top_rated', { page: String(page) });
  return data?.results && data.results.length > 0 ? data.results : FALLBACK_MOVIES;
}

export async function fetchMoviesByGenre(genreIdOrKdrama: number | string): Promise<Movie[]> {
  if (genreIdOrKdrama === 'korean_drama') {
    // Search for Korean dramas / movies
    const data = await tmdbFetch<TMDbResponse>('/discover/movie', {
      with_original_language: 'ko',
      sort_by: 'popularity.desc',
    });
    return data?.results && data.results.length > 0 ? data.results : FALLBACK_MOVIES;
  }

  const data = await tmdbFetch<TMDbResponse>('/discover/movie', {
    with_genres: String(genreIdOrKdrama),
    sort_by: 'popularity.desc',
  });
  return data?.results && data.results.length > 0 ? data.results : FALLBACK_MOVIES;
}

export async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];
  const data = await tmdbFetch<TMDbResponse>('/search/movie', { query: query.trim() });
  if (data?.results && data.results.length > 0) {
    return data.results;
  }
  // Fallback fuzzy search on fallback list
  const q = query.toLowerCase();
  return FALLBACK_MOVIES.filter(m => 
    m.title.toLowerCase().includes(q) || 
    m.overview.toLowerCase().includes(q)
  );
}

export async function fetchMovieDetails(movieId: number): Promise<Movie | null> {
  const data = await tmdbFetch<Movie>(`/movie/${movieId}`);
  if (data) return data;
  return FALLBACK_MOVIES.find(m => m.id === movieId) || null;
}

export async function fetchMovieVideos(movieId: number): Promise<TMDbVideo[]> {
  const data = await tmdbFetch<{ results: TMDbVideo[] }>(`/movie/${movieId}/videos`);
  return data?.results || [];
}

export async function fetchMovieCast(movieId: number): Promise<MovieCast[]> {
  const data = await tmdbFetch<{ cast: MovieCast[] }>(`/movie/${movieId}/credits`);
  return data?.cast?.slice(0, 6) || [];
}
