import React, { useEffect, useState } from 'react';
import { Movie, Language } from '../types';
import { fetchTrendingMovies, fetchPopularMovies, fetchTopRatedMovies } from '../services/tmdb';
import { MovieCard } from '../components/MovieCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { Flame, Star, TrendingUp } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie, e?: React.MouseEvent) => void;
  onSelectMovie: (movie: Movie) => void;
}

type HotSubTab = 'trending' | 'popular' | 'top_rated';

export const HotPage: React.FC<Props> = ({
  language,
  watchlist,
  onToggleWatchlist,
  onSelectMovie,
}) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<HotSubTab>('trending');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadCategory() {
      let data: Movie[] = [];
      if (activeTab === 'trending') {
        data = await fetchTrendingMovies('day');
      } else if (activeTab === 'popular') {
        data = await fetchPopularMovies();
      } else {
        data = await fetchTopRatedMovies();
      }

      if (isMounted) {
        setMovies(data);
        setLoading(false);
      }
    }

    loadCategory();

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const isMovieInWatchlist = (id: number) => watchlist.some((m) => m.id === id);

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="border-b border-[#292a2a] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#c1121f] text-white shadow-lg shadow-[#c1121f]/30">
            <Flame size={22} className="fill-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
              {t.hotTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              {t.hotSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Sub Tabs Toggle */}
      <div className="flex items-center gap-2 bg-[#1e2020] p-1.5 rounded-2xl border border-[#292a2a] w-fit max-w-full overflow-x-auto shadow-inner">
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'trending'
              ? 'bg-[#c1121f] text-white shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
          }`}
        >
          <Flame size={16} />
          <span>{t.tabTrending}</span>
        </button>

        <button
          onClick={() => setActiveTab('popular')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'popular'
              ? 'bg-[#f2ca50] text-[#3c2f00] shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
          }`}
        >
          <TrendingUp size={16} />
          <span>{t.tabPopular}</span>
        </button>

        <button
          onClick={() => setActiveTab('top_rated')}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer min-h-[44px] ${
            activeTab === 'top_rated'
              ? 'bg-[#292a2a] text-[#f2ca50] border border-[#f2ca50]/40 shadow-md'
              : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
          }`}
        >
          <Star size={16} className="fill-[#f2ca50]" />
          <span>{t.tabTopRated}</span>
        </button>
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
  );
};
