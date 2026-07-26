import React from 'react';
import { Genre, Language } from '../types';
import {
  Ghost,
  Zap,
  Smile,
  Heart,
  Flame,
  Wand2,
  Sparkles,
  Tv,
  Compass,
  Rocket,
  Film,
} from 'lucide-react';

interface Props {
  genre: Genre;
  language: Language;
  onClick: (genre: Genre) => void;
}

export const CategoryCard: React.FC<Props> = ({ genre, language, onClick }) => {
  const genreName = language === 'ur' ? genre.nameUrdu : genre.nameEn;

  const renderIcon = () => {
    switch (genre.iconName) {
      case 'Ghost': return <Ghost size={24} className="text-[#c1121f]" />;
      case 'Zap': return <Zap size={24} className="text-[#f2ca50]" />;
      case 'Smile': return <Smile size={24} className="text-amber-400" />;
      case 'Heart': return <Heart size={24} className="text-pink-500" />;
      case 'Flame': return <Flame size={24} className="text-orange-500" />;
      case 'Wand2': return <Wand2 size={24} className="text-purple-400" />;
      case 'Sparkles': return <Sparkles size={24} className="text-cyan-400" />;
      case 'Tv': return <Tv size={24} className="text-blue-400" />;
      case 'Compass': return <Compass size={24} className="text-emerald-400" />;
      case 'Rocket': return <Rocket size={24} className="text-indigo-400" />;
      default: return <Film size={24} className="text-[#f2ca50]" />;
    }
  };

  return (
    <div
      onClick={() => onClick(genre)}
      className="group relative h-36 rounded-2xl overflow-hidden border border-[#292a2a] hover:border-[#f2ca50]/60 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Backdrop Image */}
      <img
        src={genre.backdropUrl}
        alt={genreName}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-50"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0d0e0f] via-[#0d0e0f]/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
        <div className="p-2 bg-[#121414]/80 backdrop-blur-md rounded-xl w-fit border border-white/10 group-hover:scale-110 transition-transform">
          {renderIcon()}
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-[#f2ca50] transition-colors font-['Sora']">
            {genreName}
          </h3>
          <p className="text-xs text-[#d0c5af] font-semibold">
            Explore {language === 'ur' ? 'movies' : 'collection'} &rarr;
          </p>
        </div>
      </div>
    </div>
  );
};
