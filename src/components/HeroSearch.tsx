import React, { useState } from 'react';
import { Language } from '../types';
import { Sparkles, Search, ArrowRight } from 'lucide-react';
import { translations } from '../data/translations';

interface Props {
  language: Language;
  onSearchMood: (mood: string) => void;
}

export const HeroSearch: React.FC<Props> = ({ language, onSearchMood }) => {
  const t = translations[language];
  const [query, setQuery] = useState('');

  const exampleMoods = [
    t.prompt1,
    t.prompt2,
    t.prompt3,
    t.prompt4,
    t.prompt5,
    t.prompt6,
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchMood(query.trim());
    }
  };

  const handleChipClick = (promptText: string) => {
    setQuery(promptText);
    onSearchMood(promptText);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#1e2020] via-[#141414] to-[#121414] rounded-3xl p-6 sm:p-10 border border-[#292a2a] shadow-2xl my-4">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#f2ca50]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#c1121f]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#f2ca50]/10 border border-[#f2ca50]/30 text-[#f2ca50] text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-inner">
          <Sparkles size={14} className="animate-spin text-[#f2ca50]" />
          <span>{t.aiTitle}</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight font-['Sora']">
          {t.heroTitle}
        </h1>
        <p className="text-sm sm:text-base text-neutral-300 font-medium max-w-xl mx-auto leading-relaxed">
          {t.heroSubtitle}
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto">
          <div className="relative flex items-center bg-[#0d0e0f]/90 border-2 border-[#292a2a] focus-within:border-[#f2ca50] rounded-2xl p-2 shadow-2xl transition-all">
            <div className="pl-3 pr-2 text-[#f2ca50]">
              <Search size={22} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full bg-transparent text-white text-sm sm:text-base placeholder-neutral-500 focus:outline-none px-2 font-medium min-h-[44px]"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#3c2f00] hover:scale-105 active:scale-95 px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-lg transition-all shrink-0 cursor-pointer min-h-[44px]"
            >
              <span>{t.searchButton}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        {/* Example Mood Chips */}
        <div className="space-y-2.5 pt-2">
          <p className="text-xs sm:text-sm font-bold tracking-wider text-[#f2ca50]">
            {t.tryPrompting}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto">
            {exampleMoods.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(promptText)}
                className="bg-[#1e2020] hover:bg-[#292a2a] text-neutral-200 hover:text-[#f2ca50] border border-[#292a2a] hover:border-[#f2ca50]/40 text-xs sm:text-sm px-3.5 py-2 rounded-full font-medium transition-all shadow-sm active:scale-95 text-left cursor-pointer min-h-[38px]"
              >
                ✨ {promptText}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
