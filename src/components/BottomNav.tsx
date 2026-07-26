import React from 'react';
import { Language } from '../types';
import { Home, Grid, Sparkles, Flame, Bookmark } from 'lucide-react';
import { translations } from '../data/translations';

export type NavTab = 'home' | 'categories' | 'aimatch' | 'hot' | 'watchlist';

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  currentLanguage: Language;
  watchlistCount: number;
}

export const BottomNav: React.FC<Props> = ({
  activeTab,
  onTabChange,
  currentLanguage,
  watchlistCount,
}) => {
  const t = translations[currentLanguage];

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; isAI?: boolean }[] = [
    { id: 'home', label: t.navHome, icon: <Home size={20} /> },
    { id: 'categories', label: t.navCategories, icon: <Grid size={20} /> },
    { id: 'aimatch', label: t.navAIMatch, icon: <Sparkles size={22} className="text-[#f2ca50] animate-pulse" />, isAI: true },
    { id: 'hot', label: t.navHot, icon: <Flame size={20} /> },
    { id: 'watchlist', label: t.navWatchlist, icon: <Bookmark size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0d0e0f]/95 backdrop-blur-xl border-t border-[#292a2a] px-3 py-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 min-w-[62px] ${
                tab.isAI && isActive
                  ? 'bg-gradient-to-t from-[#f2ca50]/20 to-transparent text-[#f2ca50] font-bold scale-105'
                  : tab.isAI
                  ? 'text-[#f2ca50] hover:bg-[#1a1c1c]'
                  : isActive
                  ? 'text-[#f2ca50] font-bold bg-[#1e2020]'
                  : 'text-neutral-400 hover:text-white hover:bg-[#1a1c1c]'
              }`}
            >
              {/* Icon container */}
              <div className="relative flex items-center justify-center mb-0.5">
                {tab.icon}
                {tab.id === 'watchlist' && watchlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#c1121f] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#0d0e0f]">
                    {watchlistCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'font-bold text-[#f2ca50]' : 'font-medium'}`}>
                {tab.label}
              </span>

              {/* Active Indicator dot */}
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#f2ca50] rounded-full shadow-sm shadow-[#f2ca50]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
