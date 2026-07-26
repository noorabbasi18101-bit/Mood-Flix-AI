import React, { useEffect, useState } from 'react';
import { Movie, Language, TMDbVideo, MovieCast } from '../types';
import { getBackdropUrl, getPosterUrl, fetchMovieVideos, fetchMovieCast } from '../services/tmdb';
import { X, Star, Calendar, Clock, Play, Bookmark, Check, Sparkles, User } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  movie: Movie | null;
  language: Language;
  isInWatchlist: boolean;
  onToggleWatchlist: (movie: Movie) => void;
  onClose: () => void;
}

export const MovieDetailModal: React.FC<Props> = ({
  movie,
  language,
  isInWatchlist,
  onToggleWatchlist,
  onClose,
}) => {
  if (!movie) return null;

  const t = translations[language];
  const backdropUrl = getBackdropUrl(movie.backdrop_path || movie.poster_path);
  const posterUrl = getPosterUrl(movie.poster_path);
  const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '8.0';

  const [videos, setVideos] = useState<TMDbVideo[]>([]);
  const [cast, setCast] = useState<MovieCast[]>([]);
  const [activeTrailerKey, setActiveTrailerKey] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingMedia(true);
    setActiveTrailerKey(null);

    async function loadExtraData() {
      if (!movie) return;
      const [vids, castList] = await Promise.all([
        fetchMovieVideos(movie.id),
        fetchMovieCast(movie.id),
      ]);

      if (isMounted) {
        setVideos(vids);
        setCast(castList);
        setLoadingMedia(false);
      }
    }

    loadExtraData();

    return () => {
      isMounted = false;
    };
  }, [movie]);

  // Find trailer or teaser
  const trailerVideo = videos.find(
    (v) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  ) || videos[0];

  const aiReason = language === 'ur'
    ? (movie.aiMatchReasonUrdu || movie.aiMatchReason)
    : movie.aiMatchReason;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#141414] border border-[#292a2a] rounded-3xl overflow-hidden shadow-2xl my-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-[#121414]/80 text-white hover:bg-[#c1121f] transition-all border border-white/20 shadow-lg"
        >
          <X size={20} />
        </button>

        {/* Header Backdrop Banner */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-black">
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

          {/* Floating Hero Info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4 z-10">
            {/* Small Poster */}
            <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden border-2 border-[#f2ca50]/40 shadow-2xl shrink-0 hidden sm:block">
              <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>

            {/* Title & Key Stats */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 bg-[#f2ca50] text-[#3c2f00] text-xs font-black px-2.5 py-0.5 rounded-md">
                  <Star size={13} className="fill-[#3c2f00]" />
                  {rating}
                </span>
                <span className="flex items-center gap-1 text-xs text-neutral-300 font-semibold bg-[#292a2a] px-2.5 py-0.5 rounded-md">
                  <Calendar size={12} />
                  {releaseYear}
                </span>
                {movie.runtime && (
                  <span className="flex items-center gap-1 text-xs text-neutral-300 font-semibold bg-[#292a2a] px-2.5 py-0.5 rounded-md">
                    <Clock size={12} />
                    {movie.runtime} {t.minutes}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Sora']">
                {movie.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e2020] p-3.5 rounded-2xl border border-[#292a2a]">
            {/* Trailer Action */}
            {trailerVideo ? (
              <button
                onClick={() => setActiveTrailerKey(trailerVideo.key)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#f2ca50] text-[#3c2f00] hover:bg-[#d4af37] px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95"
              >
                <Play size={18} className="fill-[#3c2f00]" />
                <span>{t.watchTrailer}</span>
              </button>
            ) : (
              <div className="text-xs text-neutral-400 font-medium px-2 py-1">
                {t.noTrailerAvailable}
              </div>
            )}

            {/* Watchlist Toggle */}
            <button
              onClick={() => onToggleWatchlist(movie)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
                isInWatchlist
                  ? 'bg-[#292a2a] text-[#f2ca50] border border-[#f2ca50]/40'
                  : 'bg-[#c1121f] text-white hover:bg-[#a00e19]'
              }`}
            >
              {isInWatchlist ? (
                <>
                  <Check size={18} className="text-[#f2ca50]" />
                  <span>{t.savedInWatchlist}</span>
                </>
              ) : (
                <>
                  <Bookmark size={18} />
                  <span>{t.addToWatchlist}</span>
                </>
              )}
            </button>
          </div>

          {/* Active YouTube Trailer Embed Modal inside */}
          {activeTrailerKey && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#f2ca50]/50 shadow-2xl bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailerKey}?autoplay=1`}
                title="Movie Trailer"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setActiveTrailerKey(null)}
                className="absolute top-2 right-2 bg-black/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* AI Match Reason Banner */}
          {aiReason && (
            <div className="bg-gradient-to-r from-[#f2ca50]/15 via-[#1e2020] to-[#c1121f]/10 border border-[#f2ca50]/30 rounded-2xl p-4 text-sm space-y-1.5">
              <div className="flex items-center gap-2 text-[#f2ca50] font-bold">
                <Sparkles size={18} />
                <span>{t.aiWhyRecommended}</span>
              </div>
              <p className="text-neutral-200 leading-relaxed font-medium">
                {aiReason}
              </p>
            </div>
          )}

          {/* Overview Storyline */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#d0c5af]">
              {t.overview}
            </h4>
            <p className="text-neutral-300 text-sm leading-relaxed font-['Hanken_Grotesk']">
              {movie.overview || 'No storyline description available.'}
            </p>
          </div>

          {/* Cast Members */}
          {cast.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs uppercase font-extrabold tracking-wider text-[#d0c5af]">
                {t.cast}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {cast.map((actor) => (
                  <div key={actor.id} className="flex items-center gap-2.5 bg-[#1e2020] p-2 rounded-xl border border-[#292a2a]">
                    <div className="w-9 h-9 rounded-full bg-[#292a2a] overflow-hidden shrink-0 flex items-center justify-center text-neutral-400">
                      {actor.profile_path ? (
                        <img
                          src={getPosterUrl(actor.profile_path)}
                          alt={actor.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                      <p className="text-[11px] text-neutral-400 truncate">{actor.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
