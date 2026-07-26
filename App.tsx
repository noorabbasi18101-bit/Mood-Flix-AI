/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Language, Movie, Genre } from './types';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { MovieDetailModal } from './components/MovieDetailModal';
import { HomePage } from './pages/HomePage';
import { CategoriesPage } from './pages/CategoriesPage';
import { AIMatchPage } from './pages/AIMatchPage';
import { HotPage } from './pages/HotPage';
import { WatchlistPage } from './pages/WatchlistPage';

const WATCHLIST_STORAGE_KEY = 'moodflix_watchlist_v1';
const LANG_STORAGE_KEY = 'moodflix_lang_v1';

export default function App() {
  // Language state
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    return (saved === 'ur' || saved === 'en') ? saved : 'en';
  });

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Watchlist state
  const [watchlist, setWatchlist] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected Movie for Modal
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Selected Genre for Categories Page
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);

  // AI Search Prompt transfer state
  const [aiMoodPrompt, setAiMoodPrompt] = useState<string>('');

  // Persist Watchlist
  useEffect(() => {
    try {
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    } catch (e) {
      console.warn('Failed to save watchlist to localStorage', e);
    }
  }, [watchlist]);

  // Persist Language
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  // Toggle Watchlist Handler
  const handleToggleWatchlist = (movie: Movie, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [movie, ...prev];
      }
    });
  };

  // Clear Watchlist
  const handleClearWatchlist = () => {
    setWatchlist([]);
  };

  // Search Mood from Hero
  const handleSearchMoodTrigger = (mood: string) => {
    setAiMoodPrompt(mood);
    setActiveTab('aimatch');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select Genre from Home or Categories
  const handleSelectGenre = (genre: Genre | null) => {
    setSelectedGenre(genre);
    setActiveTab('categories');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isSelectedMovieInWatchlist = selectedMovie
    ? watchlist.some((m) => m.id === selectedMovie.id)
    : false;

  return (
    <div className="min-h-screen bg-[#121414] text-[#e3e2e2] flex flex-col font-['Hanken_Grotesk'] selection:bg-[#f2ca50] selection:text-[#3c2f00]">
      {/* Navigation Top Header */}
      <Navbar
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        watchlistCount={watchlist.length}
        onNavigateToWatchlist={() => setActiveTab('watchlist')}
        onNavigateToAIMatch={() => setActiveTab('aimatch')}
      />

      {/* Main Screen Page Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 pt-4 pb-24">
        {activeTab === 'home' && (
          <HomePage
            language={language}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onSelectGenre={handleSelectGenre}
            onSearchMoodTrigger={handleSearchMoodTrigger}
            onNavigateToCategories={() => setActiveTab('categories')}
            onNavigateToAIMatch={() => setActiveTab('aimatch')}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesPage
            language={language}
            watchlist={watchlist}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
          />
        )}

        {activeTab === 'aimatch' && (
          <AIMatchPage
            language={language}
            watchlist={watchlist}
            initialMoodPrompt={aiMoodPrompt}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
          />
        )}

        {activeTab === 'hot' && (
          <HotPage
            language={language}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
          />
        )}

        {activeTab === 'watchlist' && (
          <WatchlistPage
            language={language}
            watchlist={watchlist}
            onToggleWatchlist={handleToggleWatchlist}
            onClearWatchlist={handleClearWatchlist}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onNavigateToHome={() => setActiveTab('home')}
          />
        )}
      </main>

      {/* Movie Details Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        language={language}
        isInWatchlist={isSelectedMovieInWatchlist}
        onToggleWatchlist={(movie) => handleToggleWatchlist(movie)}
        onClose={() => setSelectedMovie(null)}
      />

      {/* Fixed Bottom Navigation Bar (Home, Categories, AI Match, Hot, Watchlist) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentLanguage={language}
        watchlistCount={watchlist.length}
      />
    </div>
  );
}
