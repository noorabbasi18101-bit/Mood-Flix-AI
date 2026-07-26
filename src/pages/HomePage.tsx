import React, { useEffect, useState } from 'react';
import { Movie, Genre, Language } from '../types';
import { fetchPopularMovies } from '../services/tmdb';
import { HeroSearch } from '../components/HeroSearch';
import { MovieCard } from '../components/MovieCard';
import { CategoryCard } from '../components/CategoryCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { MOVIE_GENRES } from '../data/genres';
import { Sparkles, ArrowRight, Flame } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie, e?: React.MouseEvent) => void;
  onSelectMovie: (movie: Movie) => void;
  onSelectGenre: (genre: Genre) => void;
  onSearchMoodTrigger: (mood: string) => void;
  onNavigateToCategories: () => void;
  onNavigateToAIMatch: () => void;
}

export const HomePage: React.FC<Props> = ({
  language,
  watchlist,
  onToggleWatchlist,
  onSelectMovie,
  onSelectGenre,
  onSearchMoodTrigger,
  onNavigateToCategories,
  onNavigateToAIMatch,
}) => {
  const t = translations[language];
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadMovies() {
      const movies = await fetchPopularMovies();
      if (isMounted) {
        setPopularMovies(movies);
        setLoading(false);
      }
    }

    loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const isMovieInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Mood Search */}
      <HeroSearch language={language} onSearchMood={onSearchMoodTrigger} />

      {/* Popular Movies Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f2ca50]/10 border border-[#f2ca50]/20 text-[#f2ca50]">
              <Flame size={20} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Sora']">
                {t.popularMovies}
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                {language === 'ur' ? 'Sab se zyada dekhi jaane wali movies' : 'Trending films loved by audiences worldwide'}
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
            {popularMovies.slice(0, 8).map((movie) => (
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
      </section>

      {/* AI Match Feature Spotlight Card */}
      <section className="bg-gradient-to-r from-[#1e2020] via-[#292a2a] to-[#1e2020] border border-[#f2ca50]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg z-10">
          <div className="inline-flex items-center gap-1.5 bg-[#f2ca50]/10 text-[#f2ca50] text-xs font-black px-3 py-1 rounded-full">
            <Sparkles size={14} />
            <span>AI Matchmaker</span>
          </div>
          <h3 className="text-2xl font-black text-white font-['Sora']">
            {language === 'ur' ? 'Apne Mood Ke Mutabiq Movie Dhoondain' : 'Find Movies by Your Exact Mood'}
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed font-['Hanken_Grotesk']">
            {language === 'ur'
              ? 'Likhye: "Mera mood dark aur mysterious hai" ya "I want a scary movie". AI bilkul exact match dhoond nikaalega!'
              : 'Describe your vibe in plain words. MoodFlix AI uses Gemini intelligence to scan TMDb and curate tailored matches.'}
          </p>
        </div>

        <button
          onClick={onNavigateToAIMatch}
          className="z-10 bg-[#f2ca50] text-[#3c2f00] hover:bg-[#d4af37] px-6 py-3.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <span>{t.navAIMatch}</span>
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Recommended Categories Preview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-['Sora']">
              {t.recommendedCategories}
            </h2>
            <p className="text-xs text-neutral-400 font-medium">
              {language === 'ur' ? 'Apni pasandida category select karein' : 'Explore by genre, theme, and region'}
            </p>
          </div>
          <button
            onClick={onNavigateToCategories}
            className="text-xs font-bold text-[#f2ca50] hover:underline flex items-center gap-1"
          >
            <span>{t.viewAll}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {MOVIE_GENRES.slice(0, 6).map((genre) => (
            <CategoryCard
              key={genre.id}
              genre={genre}
              language={language}
              onClick={onSelectGenre}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
