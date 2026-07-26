import React from 'react';
import { Movie, Language } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Bookmark, Film, Trash2 } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  watchlist: Movie[];
  onToggleWatchlist: (movie: Movie, e?: React.MouseEvent) => void;
  onClearWatchlist: () => void;
  onSelectMovie: (movie: Movie) => void;
  onNavigateToHome: () => void;
}

export const WatchlistPage: React.FC<Props> = ({
  language,
  watchlist,
  onToggleWatchlist,
  onClearWatchlist,
  onSelectMovie,
  onNavigateToHome,
}) => {
  const t = translations[language];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between border-b border-[#292a2a] pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] shadow-lg">
            <Bookmark size={22} className="fill-[#3c2f00]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Sora']">
              {t.watchlistTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              {t.watchlistSubtitle}
            </p>
          </div>
        </div>

        {watchlist.length > 0 && (
          <button
            onClick={onClearWatchlist}
            className="flex items-center gap-1.5 bg-[#1e2020] hover:bg-red-950/40 border border-[#292a2a] hover:border-red-500/50 text-neutral-300 hover:text-red-400 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[40px]"
          >
            <Trash2 size={16} />
            <span>{language === 'ur' ? 'Sab Hataein' : 'Clear All'}</span>
          </button>
        )}
      </div>

      {/* Watchlist Contents */}
      {watchlist.length === 0 ? (
        <div className="text-center py-16 px-6 bg-[#1e2020] border border-[#292a2a] rounded-3xl max-w-md mx-auto space-y-4 my-8">
          <div className="w-16 h-16 bg-[#121414] border border-[#f2ca50]/20 rounded-full flex items-center justify-center mx-auto text-[#f2ca50]">
            <Film size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white font-['Sora']">
              {t.watchlistEmptyTitle}
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.watchlistEmptyDesc}
            </p>
          </div>
          <button
            onClick={onNavigateToHome}
            className="bg-[#f2ca50] text-[#3c2f00] hover:bg-[#d4af37] px-6 py-2.5 rounded-2xl font-black text-xs shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            {t.exploreMoviesBtn}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {watchlist.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              language={language}
              isInWatchlist={true}
              onToggleWatchlist={onToggleWatchlist}
              onClick={onSelectMovie}
            />
          ))}
        </div>
      )}
    </div>
  );
};
