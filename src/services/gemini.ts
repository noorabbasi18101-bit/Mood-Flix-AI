import { Language, Movie, MoodMatchResponse } from '../types';
import { FALLBACK_MOVIES, searchMovies } from './tmdb';

export async function generateAIMoodMatch(mood: string, language: Language): Promise<{
  aiSummary: string;
  movies: Movie[];
}> {
  try {
    const response = await fetch('/api/ai/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, language }),
    });

    if (!response.ok) {
      throw new Error(`AI Match API failed: ${response.statusText}`);
    }

    const data: MoodMatchResponse = await response.json();
    const recommendedList = data.recommendedMovies || [];

    // For each recommended title, map the server TMDb candidate directly
    const matchedMoviesPromises = recommendedList.map(async (rec) => {
      const reason = language === 'ur' 
        ? (rec.matchReasonUrdu || rec.matchReasonEn) 
        : rec.matchReasonEn;

      if (rec.poster_path) {
        return {
          id: rec.tmdbId || Math.floor(Math.random() * 100000),
          title: rec.title,
          overview: rec.overview || reason,
          poster_path: rec.poster_path,
          backdrop_path: rec.backdrop_path || null,
          release_date: rec.year ? `${rec.year}-01-01` : '2023-01-01',
          vote_average: rec.rating || 8.0,
          vote_count: 1500,
          aiMatchReason: reason,
          aiMatchReasonUrdu: rec.matchReasonUrdu,
          matchScore: rec.matchScore || Math.floor(88 + Math.random() * 10),
          moodTags: rec.moodTags || ['AI Curated', 'Matched Mood'],
        } as Movie;
      }

      const tmdbResults = await searchMovies(rec.title);
      const matched = tmdbResults[0] || null;

      if (matched) {
        return {
          ...matched,
          aiMatchReason: reason,
          aiMatchReasonUrdu: rec.matchReasonUrdu,
          matchScore: rec.matchScore || Math.floor(88 + Math.random() * 10),
          moodTags: rec.moodTags || ['AI Curated', 'Matched Mood'],
        } as Movie;
      } else {
        return {
          id: rec.tmdbId || Math.floor(Math.random() * 100000),
          title: rec.title,
          overview: rec.overview || reason,
          poster_path: null,
          backdrop_path: null,
          release_date: rec.year || '2023',
          vote_average: rec.rating || 8.3,
          vote_count: 1200,
          aiMatchReason: reason,
          aiMatchReasonUrdu: rec.matchReasonUrdu,
          matchScore: rec.matchScore || 92,
          moodTags: rec.moodTags || ['Recommended'],
        } as Movie;
      }
    });

    const movies = await Promise.all(matchedMoviesPromises);
    const summary = language === 'ur' ? data.aiSummaryUrdu : data.aiSummaryEn;

    return {
      aiSummary: summary || (language === 'ur' ? 'Aap ke mood ke hisab se ye top recommendations hain:' : 'Here are top recommendations tailored for your mood:'),
      movies: movies.filter(m => Boolean(m.title)),
    };
  } catch (err) {
    console.warn('AI Match fallback triggered:', err);
    // Intelligent local client-side mood matcher as fallback
    return generateFallbackMoodMatch(mood, language);
  }
}

export interface ChatResponseMessage {
  replyText: string;
  movies: Movie[];
}

export async function sendAIChatMessage(
  message: string,
  language: Language,
  history: { sender: 'user' | 'ai'; text: string }[] = [],
  previouslyRecommended: string[] = []
): Promise<ChatResponseMessage> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, language, history, previouslyRecommended }),
    });

    if (!response.ok) {
      throw new Error(`AI Chat API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const replyText = data.replyText || '';
    const rawCards = data.movieCards || [];

    // Enrich movie cards using TMDb server candidates directly
    const moviePromises = rawCards.map(async (card: any) => {
      if (card.poster_path) {
        return {
          id: card.tmdbId || Math.floor(Math.random() * 1000000),
          title: card.title,
          overview: card.overview || card.matchReason,
          poster_path: card.poster_path,
          backdrop_path: card.backdrop_path || null,
          release_date: card.year ? `${card.year}-01-01` : '2023-01-01',
          vote_average: card.rating || 8.0,
          vote_count: 1200,
          aiMatchReason: card.matchReason || card.overview,
          moodTags: [card.genre || 'AI Movie Chat'],
        } as Movie;
      }

      const tmdbResults = await searchMovies(card.title);
      const matched = tmdbResults[0] || null;

      if (matched) {
        return {
          ...matched,
          aiMatchReason: card.matchReason || card.summary || card.overview,
          aiMatchReasonUrdu: card.matchReason,
          vote_average: card.rating || matched.vote_average || 8.0,
          moodTags: [card.genre || 'AI Movie Chat'],
        } as Movie;
      } else {
        return {
          id: card.tmdbId || Math.floor(Math.random() * 1000000),
          title: card.title,
          overview: card.overview || card.summary || card.matchReason,
          poster_path: null,
          backdrop_path: null,
          release_date: card.year || '2023',
          vote_average: card.rating || 8.2,
          vote_count: 1000,
          aiMatchReason: card.matchReason,
          moodTags: [card.genre || 'Recommended'],
        } as Movie;
      }
    });

    const movies = await Promise.all(moviePromises);

    return {
      replyText,
      movies: movies.filter((m) => Boolean(m.title)),
    };
  } catch (err) {
    console.warn('AI Chat fallback triggered:', err);
    const isUrdu = language === 'ur';
    const fallbackMatches = FALLBACK_MOVIES.slice(0, 2);
    return {
      replyText: isUrdu
        ? `Aap ke paighaam "${message}" ke hawale se, ye movies sab se top hain:`
        : `Based on your request "${message}", here are recommended films:`,
      movies: fallbackMatches,
    };
  }
}

function generateFallbackMoodMatch(mood: string, language: Language): { aiSummary: string; movies: Movie[] } {
  const q = mood.toLowerCase();
  
  // Filter fallback movies based on keywords
  let matches = FALLBACK_MOVIES.filter(m => {
    const text = (m.title + ' ' + m.overview + ' ' + (m.moodTags?.join(' ') || '')).toLowerCase();
    if (q.includes('horror') || q.includes('scary')) return text.includes('horror') || text.includes('dark');
    if (q.includes('thriller') || q.includes('psychological') || q.includes('suspense')) return text.includes('thriller') || text.includes('mind-bending') || text.includes('crime');
    if (q.includes('funny') || q.includes('comedy') || q.includes('relaxing')) return text.includes('comedy') || text.includes('relaxing') || text.includes('anime');
    if (q.includes('korean') || q.includes('drama') || q.includes('k drama')) return text.includes('korean') || text.includes('drama');
    if (q.includes('romantic') || q.includes('love') || q.includes('romance')) return text.includes('love') || text.includes('hopeful');
    if (q.includes('action') || q.includes('fight') || q.includes('hero')) return text.includes('action') || text.includes('dark knight');
    return true;
  });

  if (matches.length === 0) {
    matches = FALLBACK_MOVIES.slice(0, 4);
  }

  const decorated = matches.map((m, idx) => {
    const score = 98 - idx * 2;
    const reasonEn = `This film perfectly matches your '${mood}' mood with its engaging storyline and atmosphere.`;
    const reasonUrdu = `Aap ke '${mood}' mood ke hisab se ye movie bilkul perfect match hai. Is ki story aur atmosphere zabardast hai.`;

    return {
      ...m,
      aiMatchReason: reasonEn,
      aiMatchReasonUrdu: reasonUrdu,
      matchScore: score,
    };
  });

  const aiSummary = language === 'ur'
    ? `Aap ke mood "${mood}" ke mutabiq ye movies sab se best hain:`
    : `Based on your mood "${mood}", these movies are top matches:`;

  return {
    aiSummary,
    movies: decorated,
  };
}
