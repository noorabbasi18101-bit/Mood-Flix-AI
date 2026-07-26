import React from 'react';
import { Movie, Language } from '../types';
import { getPosterUrl } from '../services/tmdb';
import { Star, Bookmark, Check, Sparkles, Calendar } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  movie: Movie;
  language: Language;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie, e: React.MouseEvent) => void;
  onClick: (movie: Movie) => void;
}

export const MovieCard: React.FC<Props> = ({
  movie,
  language,
  isInWatchlist,
  onToggleWatchlist,
  onClick,
}) => {
  const t = translations[language];
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';

  const aiReason = language === 'ur'
    ? (movie.aiMatchReasonUrdu || movie.aiMatchReason)
    : movie.aiMatchReason;

  return (
    <div
      onClick={() => onClick(movie)}
      className="group relative bg-[#1e2020] border border-[#292a2a] hover:border-[#f2ca50]/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-[#f2ca50]/10 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1.5"
    >
      {/* Poster Image Box */}
      <div className="relative aspect-[2/3] w-full bg-[#121414] overflow-hidden">
        <img
          src={posterUrl}
          alt={movie.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Top Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e2020] via-transparent to-black/60" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 z-10">
          {/* TMDB Rating Badge */}
          <div className="flex items-center gap-1 bg-[#121414]/85 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-xs font-bold text-[#f2ca50]">
            <Star size={13} className="fill-[#f2ca50] text-[#f2ca50]" />
            <span>{rating}</span>
          </div>

          {/* AI Match Score or Watchlist button */}
          {movie.matchScore ? (
            <div className="flex items-center gap-1 bg-[#c1121f]/90 backdrop-blur-md text-white text-[11px] font-extrabold px-2 py-0.5 rounded-md shadow-md border border-white/10">
              <Sparkles size={11} className="text-[#f2ca50]" />
              <span>{movie.matchScore}% Match</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#121414]/85 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 text-[11px] font-medium text-neutral-300">
              <Calendar size={11} className="text-neutral-400" />
              <span>{releaseYear}</span>
            </div>
          )}
        </div>

        {/* Watchlist Quick Action Button */}
        <button
          onClick={(e) => onToggleWatchlist(movie, e)}
          className={`absolute bottom-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-all shadow-xl active:scale-90 ${
            isInWatchlist
              ? 'bg-[#c1121f] text-white border border-[#c1121f]'
              : 'bg-[#121414]/80 text-[#d0c5af] hover:text-white hover:bg-[#c1121f] border border-white/10'
          }`}
          title={isInWatchlist ? t.removeFromWatchlist : t.addToWatchlist}
        >
          {isInWatchlist ? <Check size={16} className="stroke-[3]" /> : <Bookmark size={16} />}
        </button>
      </div>

      {/* Content Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
        <div>
          {/* Release Year & Genre tags */}
          <div className="flex items-center justify-between text-xs text-[#d0c5af] font-semibold mb-1">
            <span>{releaseYear}</span>
            <span className="truncate max-w-[120px] text-neutral-300">
              {movie.genres?.[0]?.name || 'Cinema'}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug line-clamp-1 group-hover:text-[#f2ca50] transition-colors font-['Sora']">
            {movie.title}
          </h3>

          {/* Short Summary */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 mt-1.5 leading-relaxed font-medium">
            {movie.overview || 'No storyline summary available.'}
          </p>
        </div>

        {/* AI Match Reason Pill (if generated) */}
        {aiReason && (
          <div className="bg-[#f2ca50]/10 border border-[#f2ca50]/25 rounded-xl p-2.5 text-xs text-[#f2ca50] flex items-start gap-1.5 leading-snug">
            <Sparkles size={14} className="shrink-0 mt-0.5 text-[#f2ca50]" />
            <p className="line-clamp-2 font-medium">
              <span className="font-bold">{t.aiWhyRecommended}</span> {aiReason}
            </p>
          </div>
        )}

        {/* Add to Watchlist Footer Button */}
        <button
          onClick={(e) => onToggleWatchlist(movie, e)}
          className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm min-h-[40px] cursor-pointer ${
            isInWatchlist
              ? 'bg-[#1a1c1c] text-[#f2ca50] border border-[#f2ca50]/30 hover:bg-[#292a2a]'
              : 'bg-[#c1121f] text-white hover:bg-[#a00e19] active:scale-98'
          }`}
        >
          {isInWatchlist ? (
            <>
              <Check size={14} className="text-[#f2ca50]" />
              <span>{t.savedInWatchlist}</span>
            </>
          ) : (
            <>
              <Bookmark size={14} />
              <span>{t.addToWatchlist}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
