import React from 'react';
import { Language } from '../types';
import { Globe } from 'lucide-react';

interface Props {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-1.5 bg-[#1e2020] border border-[#343535] p-1 rounded-full text-xs font-semibold shadow-inner">
      <div className="pl-2 pr-1 text-[#d0c5af] flex items-center gap-1">
        <Globe size={14} className="text-[#f2ca50]" />
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-neutral-400">Lang:</span>
      </div>
      <button
        onClick={() => onLanguageChange('en')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          currentLanguage === 'en'
            ? 'bg-[#f2ca50] text-[#3c2f00] font-bold shadow-sm'
            : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
        }`}
      >
        English
      </button>
      <button
        onClick={() => onLanguageChange('ur')}
        className={`px-2.5 py-1 rounded-full transition-all duration-200 ${
          currentLanguage === 'ur'
            ? 'bg-[#c1121f] text-white font-bold shadow-sm'
            : 'text-neutral-400 hover:text-white hover:bg-[#292a2a]'
        }`}
      >
        Roman Urdu
      </button>
    </div>
  );
};
