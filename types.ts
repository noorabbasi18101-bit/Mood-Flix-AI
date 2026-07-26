export type Language = 'en' | 'ur';

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  media_type?: string;
  // Custom AI properties
  aiMatchReason?: string;
  aiMatchReasonUrdu?: string;
  matchScore?: number;
  moodTags?: string[];
}

export interface TMDbResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number | string;
  nameEn: string;
  nameUrdu: string;
  iconName: string;
  backdropUrl: string;
  tmdbGenreId?: number;
  isKoreanDrama?: boolean;
}

export interface MoodMatchResponse {
  recommendedMovies: {
    title: string;
    tmdbId?: number;
    matchScore: number;
    matchReasonEn: string;
    matchReasonUrdu: string;
    moodTags: string[];
  }[];
  aiSummaryEn: string;
  aiSummaryUrdu: string;
}

export interface TMDbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
