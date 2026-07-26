import React from 'react';
import { Language } from '../types';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Film, Bookmark, Sparkles } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  watchlistCount: number;
  onNavigateToWatchlist: () => void;
  onNavigateToAIMatch: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentLanguage,
  onLanguageChange,
  watchlistCount,
  onNavigateToWatchlist,
  onNavigateToAIMatch,
}) => {
  const t = translations[currentLanguage];

  return (
    <header className="sticky top-0 z-40 bg-[#0d0e0f]/90 backdrop-blur-md border-b border-[#292a2a]/60 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f2ca50] via-[#c1121f] to-[#121414] p-0.5 shadow-lg shadow-[#c1121f]/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <div className="w-full h-full bg-[#121414] rounded-[10px] flex items-center justify-center">
              <Film className="w-5 h-5 text-[#f2ca50]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Sora']">
                Mood<span className="text-[#f2ca50]">Flix</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-[#c1121f] text-white rounded-md shadow-sm">
                AI
              </span>
            </div>
            <p className="text-[11px] text-[#d0c5af] hidden sm:block font-medium">
              {t.appTagline}
            </p>
          </div>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Quick AI Match CTA */}
          <button
            onClick={onNavigateToAIMatch}
            className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-[#f2ca50]/15 to-[#c1121f]/20 border border-[#f2ca50]/30 hover:border-[#f2ca50] text-[#f2ca50] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md hover:shadow-[#f2ca50]/20 active:scale-95"
          >
            <Sparkles size={14} className="animate-pulse text-[#f2ca50]" />
            <span>{t.navAIMatch}</span>
          </button>

          {/* Quick Watchlist Button */}
          <button
            onClick={onNavigateToWatchlist}
            className="relative p-2 rounded-full bg-[#1e2020] border border-[#343535] hover:border-[#f2ca50] text-[#d0c5af] hover:text-white transition-all shadow-sm group"
            title={t.navWatchlist}
          >
            <Bookmark size={18} className="group-hover:scale-110 transition-transform text-[#f2ca50]" />
            {watchlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#c1121f] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121414] animate-bounce">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
        </div>
      </div>
    </header>
  );
};
