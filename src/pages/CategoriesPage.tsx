import React, { useEffect, useState } from 'react';
import { Genre, Movie, Language } from '../types';
import { MOVIE_GENRES } from '../data/genres';
import { CategoryCard } from '../components/CategoryCard';
import { MovieCard } from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { fetchMoviesByGenre } from '../services/tmdb';
import { Grid, Film, ArrowLeft } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  watchlist: Movie[];
  selectedGenre: Genre | null;
  onSelectGenre: (genre: Genre | null) => void;
  onToggleWatchlist: (movie: Movie, e?: React.MouseEvent) => void;
  onSelectMovie: (movie: Movie) => void;
}

export const CategoriesPage: React.FC<Props> = ({
  language,
  watchlist,
  selectedGenre,
  onSelectGenre,
  onToggleWatchlist,
  onSelectMovie,
}) => {
  const t = translations[language];
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedGenre) return;

    let isMounted = true;
    setLoading(true);

    async function loadGenreMovies() {
      if (!selectedGenre) return;
      const results = await fetchMoviesByGenre(selectedGenre.tmdbGenreId || selectedGenre.id);
      if (isMounted) {
        setMovies(results);
        setLoading(false);
      }
    }

    loadGenreMovies();

    return () => {
      isMounted = false;
    };
  }, [selectedGenre]);

  const isMovieInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  return (
    <div className="space-y-8 pb-12">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-[#292a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f2ca50]/10 border border-[#f2ca50]/20 text-[#f2ca50]">
              <Grid size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
              {t.categoriesTitle}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-1">
            {t.categoriesSubtitle}
          </p>
        </div>

        {selectedGenre && (
          <button
            onClick={() => onSelectGenre(null)}
            className="flex items-center gap-1.5 bg-[#1e2020] hover:bg-[#292a2a] border border-[#292a2a] text-neutral-300 hover:text-white px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px]"
          >
            <ArrowLeft size={16} />
            <span>{language === 'ur' ? 'Sab Categories' : 'All Categories'}</span>
          </button>
        )}
      </div>

      {/* Genre Grid or Active Genre Movies */}
      {!selectedGenre ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {MOVIE_GENRES.map((genre) => (
            <CategoryCard
              key={genre.id}
              genre={genre}
              language={language}
              onClick={onSelectGenre}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Category Header */}
          <div className="bg-[#1e2020] border border-[#f2ca50]/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Film className="text-[#f2ca50]" size={24} />
              <div>
                <h2 className="text-xl font-black text-white font-['Sora']">
                  {language === 'ur' ? selectedGenre.nameUrdu : selectedGenre.nameEn}
                </h2>
                <p className="text-xs text-neutral-400">
                  {movies.length} {t.resultsCount}
                </p>
              </div>
            </div>
          </div>

          {/* Movies Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  language={language}
                  isInWatchlist={isMovieInWatchlist(movie.id)}
                  onToggleWatchlist={onToggleWatchlist}
                  onClick={onSelectMovie}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
