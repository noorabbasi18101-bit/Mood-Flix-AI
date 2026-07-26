import { Language } from '../types';

export interface TranslationSet {
  // Brand
  appName: string;
  appTagline: string;
  
  // Navigation
  navHome: string;
  navCategories: string;
  navAIMatch: string;
  navHot: string;
  navWatchlist: string;

  // Home Page
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  searchButton: string;
  tryPrompting: string;
  popularMovies: string;
  recommendedCategories: string;
  viewAll: string;
  
  // Example Mood Prompts
  prompt1: string;
  prompt2: string;
  prompt3: string;
  prompt4: string;
  prompt5: string;
  prompt6: string;

  // Categories Page
  categoriesTitle: string;
  categoriesSubtitle: string;

  // AI Match Page
  aiTitle: string;
  aiSubtitle: string;
  aiTabGenerator: string;
  aiTabChat: string;
  aiInputPlaceholder: string;
  aiMatchButton: string;
  aiSearching: string;
  aiWhyRecommended: string;
  aiMatchScore: string;
  aiExamplesTitle: string;
  aiNoResults: string;
  aiErrorMessage: string;
  chatWelcomeTitle: string;
  chatWelcomeSubtitle: string;
  chatInputPlaceholder: string;
  chatSend: string;
  chatQuickQueries: string;

  // Hot Page
  hotTitle: string;
  hotSubtitle: string;
  tabTrending: string;
  tabPopular: string;
  tabTopRated: string;

  // Watchlist Page
  watchlistTitle: string;
  watchlistSubtitle: string;
  watchlistEmptyTitle: string;
  watchlistEmptyDesc: string;
  exploreMoviesBtn: string;
  removeFromWatchlist: string;
  addToWatchlist: string;
  savedInWatchlist: string;

  // Movie Details Modal
  releaseYear: string;
  rating: string;
  genres: string;
  overview: string;
  watchTrailer: string;
  close: string;
  noTrailerAvailable: string;
  cast: string;
  runtime: string;
  minutes: string;

  // Common UI
  loading: string;
  errorTitle: string;
  retry: string;
  searchResultFor: string;
  resultsCount: string;
  clearSearch: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    appName: 'MoodFlix AI',
    appTagline: 'Discover Movies That Match Your Mood',
    navHome: 'Home',
    navCategories: 'Categories',
    navAIMatch: 'AI Match',
    navHot: 'Hot',
    navWatchlist: 'Watchlist',

    heroTitle: 'How are you feeling today?',
    heroSubtitle: 'Tell us your mood or preference, and our AI will curate the perfect movie experience for you.',
    searchPlaceholder: 'Tell me your mood... e.g. I want psychological horror',
    searchButton: 'Find Movies',
    tryPrompting: 'Try these moods:',
    popularMovies: 'Popular Right Now',
    recommendedCategories: 'Explore Categories',
    viewAll: 'View All',

    prompt1: 'I want horror',
    prompt2: 'Psychological thriller',
    prompt3: 'Funny movie',
    prompt4: 'Korean drama',
    prompt5: 'Fantasy action',
    prompt6: 'Romantic but not sad',

    categoriesTitle: 'Movie Genres & Categories',
    categoriesSubtitle: 'Browse our curated collection across top film genres',

    aiTitle: 'AI Movie Matchmaker',
    aiSubtitle: 'Type how you are feeling or chat with our AI assistant to discover perfect movie recommendations.',
    aiTabGenerator: 'Mood Matcher',
    aiTabChat: 'AI Movie Chat',
    aiInputPlaceholder: 'Type your mood... (e.g. My mood is dark and mysterious)',
    aiMatchButton: 'Generate AI Recommendations',
    aiSearching: 'AI is analyzing your mood and searching TMDb...',
    aiWhyRecommended: 'Why Recommended:',
    aiMatchScore: 'Match Score',
    aiExamplesTitle: 'Need inspiration? Click any mood below:',
    aiNoResults: 'No AI matches found. Try describing your mood with different keywords!',
    aiErrorMessage: 'Unable to connect to AI server. Showing top TMDb matches instead.',
    chatWelcomeTitle: 'AI Cinema Chat Assistant',
    chatWelcomeSubtitle: 'Ask about any movie summary, rating, or tell me what movie you want to watch!',
    chatInputPlaceholder: 'Ask a question... (e.g. "Is movie ki summary kya hai?" or "Psychological horror movie chahiye")',
    chatSend: 'Send',
    chatQuickQueries: 'Quick Chat Questions:',

    hotTitle: 'Hot & Trending',
    hotSubtitle: 'The most talked about, trending, and top-rated movies across the world right now',
    tabTrending: '🔥 Trending',
    tabPopular: '🌟 Popular',
    tabTopRated: '🏆 Top Rated',

    watchlistTitle: 'Your Watchlist',
    watchlistSubtitle: 'Movies you saved to watch later. Access your personalized cinema collection anytime.',
    watchlistEmptyTitle: 'Your Watchlist is Empty',
    watchlistEmptyDesc: 'You haven\'t added any movies to your watchlist yet. Find movies you love and click "Add to Watchlist"!',
    exploreMoviesBtn: 'Explore Movies Now',
    removeFromWatchlist: 'Remove',
    addToWatchlist: '+ Add to Watchlist',
    savedInWatchlist: 'Saved in Watchlist',

    releaseYear: 'Release',
    rating: 'Rating',
    genres: 'Genres',
    overview: 'Storyline',
    watchTrailer: 'Watch Trailer',
    close: 'Close',
    noTrailerAvailable: 'Trailer unavailable for this title',
    cast: 'Main Cast',
    runtime: 'Runtime',
    minutes: 'mins',

    loading: 'Loading cinema magic...',
    errorTitle: 'Something went wrong',
    retry: 'Try Again',
    searchResultFor: 'Results for',
    resultsCount: 'movies found',
    clearSearch: 'Clear Search',
  },
  ur: {
    appName: 'MoodFlix AI',
    appTagline: 'Aap Ke Mood Ke Mutabiq Behtareen Movies',
    navHome: 'Home',
    navCategories: 'Categories',
    navAIMatch: 'AI Match',
    navHot: 'Hot',
    navWatchlist: 'Watchlist',

    heroTitle: 'Aaj Aap Ka Mood Kaisa Hai?',
    heroSubtitle: 'Apna mood ya pasand batayein, aur hamara AI aap ke liye sab se behtareen movie dhoond kar laye ga.',
    searchPlaceholder: 'Apna mood batayein... maslan: Mujhe horror movie chahiye',
    searchButton: 'Movie Dhoondain',
    tryPrompting: 'Ye mood try karein:',
    popularMovies: 'Aaj Kal Ki Popular Movies',
    recommendedCategories: 'Categories Dekhein',
    viewAll: 'Sab Dekhein',

    prompt1: 'Mujhe horror movie chahiye',
    prompt2: 'Psychological thriller',
    prompt3: 'Mazahia funny movie',
    prompt4: 'Korean drama',
    prompt5: 'Fantasy action movie',
    prompt6: 'Romantic lekin sad na ho',

    categoriesTitle: 'Movie Genres Aur Categories',
    categoriesSubtitle: 'Apni pasandida category choose karein aur behtareen movies dekhein',

    aiTitle: 'AI Movie Matchmaker',
    aiSubtitle: 'Apna mood batayein ya AI Chat assistant se kisi bhi movie ke baare mein poochein.',
    aiTabGenerator: 'Mood Matcher',
    aiTabChat: 'AI Movie Chat 💬',
    aiInputPlaceholder: 'Apna mood likhein... (maslan: Mera mood dark aur mysterious hai)',
    aiMatchButton: 'AI Se Movies Dhoondain',
    aiSearching: 'AI aap ke mood ko samajh raha hai aur movies dhoond raha hai...',
    aiWhyRecommended: 'Kyun Recommended Hai:',
    aiMatchScore: 'Match Score',
    aiExamplesTitle: 'Kasam se idea nahi mil raha? In par click karein:',
    aiNoResults: 'Koi AI match nahi mila. Thora different alfaz mein apna mood likhein!',
    aiErrorMessage: 'AI server connect nahi ho saka. Top TMDb movies dikhai ja rahi hain.',
    chatWelcomeTitle: 'AI Movie Chat Assistant',
    chatWelcomeSubtitle: 'Kisi bhi movie ki summary poochein, rating jaanein, ya apni marzi ki movie maangein!',
    chatInputPlaceholder: 'Likhye... (maslan: "Is movie ki summary kya hai?" ya "Mujhe psychological horror chahiye")',
    chatSend: 'Bhejein',
    chatQuickQueries: 'Aasan Sawaal:',

    hotTitle: 'Hot Aur Trending Movies',
    hotSubtitle: 'Is waqt duniya bhar mein sab se zyada dekhi jaane wali aur top rated movies',
    tabTrending: '🔥 Trending',
    tabPopular: '🌟 Popular',
    tabTopRated: '🏆 Top Rated',

    watchlistTitle: 'Aap Ki Watchlist',
    watchlistSubtitle: 'Aap ki save ki hui movies. Jab chahein apni pasandida movies dekhein.',
    watchlistEmptyTitle: 'Aap Ki Watchlist Khali Hai',
    watchlistEmptyDesc: 'Aap ne abhi tak koi movie save nahi ki. Movies dhoondain aur "Add to Watchlist" par click karein!',
    exploreMoviesBtn: 'Movies Explore Karein',
    removeFromWatchlist: 'Hataein',
    addToWatchlist: '+ Watchlist Mein Shamil Karein',
    savedInWatchlist: 'Watchlist Mein Save Hai',

    releaseYear: 'Release Sal',
    rating: 'Rating',
    genres: 'Genres',
    overview: 'Kahani / Overview',
    watchTrailer: 'Trailer Dekhein',
    close: 'Band Karein',
    noTrailerAvailable: 'Is movie ka trailer available nahi hai',
    cast: 'Main Cast',
    runtime: 'Daurania',
    minutes: 'minute',

    loading: 'Movies load ho rahi hain...',
    errorTitle: 'Koi masla ho gaya hai',
    retry: 'Dobara Koshish Karein',
    searchResultFor: 'Ke liye results',
    resultsCount: 'movies mili hain',
    clearSearch: 'Search Khali Karein',
  },
};
