import { Type } from '@google/genai';
import {
  ai,
  apiKey,
  DEFAULT_TMDB_KEY,
  fetchTmdbCandidates,
  getSmartChatFallback,
} from '../_helpers';

async function enrichMovieCardsWithTmdb(cards: any[], candidates: any[] = []): Promise<any[]> {
  if (!Array.isArray(cards) || cards.length === 0) return [];

  const tmdbKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY || DEFAULT_TMDB_KEY;

  const candidateMap = new Map<string, any>();
  for (const cand of candidates) {
    if (cand && cand.title) {
      candidateMap.set(cand.title.toLowerCase().trim(), cand);
    }
  }

  const enriched = await Promise.all(
    cards.map(async (card: any) => {
      try {
        const titleStr = (card.title || '').trim();
        if (!titleStr) return card;

        let match = candidateMap.get(titleStr.toLowerCase()) || null;

        if (!match || !match.poster_path) {
          const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(titleStr)}&page=1`;
          const res = await fetch(searchUrl);
          if (res.ok) {
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              match = data.results[0];
            }
          }
        }

        if (!match || !match.poster_path) {
          const tvUrl = `https://api.themoviedb.org/3/search/tv?api_key=${tmdbKey}&query=${encodeURIComponent(titleStr)}&page=1`;
          const tvRes = await fetch(tvUrl);
          if (tvRes.ok) {
            const tvData = await tvRes.json();
            if (tvData.results && tvData.results.length > 0) {
              match = tvData.results[0];
            }
          }
        }

        if (match) {
          let trailerKey: string | null = card.trailer_key || card.trailer || null;
          if (!trailerKey && match.id) {
            try {
              const isTv = Boolean(match.name && !match.title);
              const mediaType = isTv ? 'tv' : 'movie';
              const vidRes = await fetch(`https://api.themoviedb.org/3/${mediaType}/${match.id}/videos?api_key=${tmdbKey}`);
              if (vidRes.ok) {
                const vidData = await vidRes.json();
                if (vidData.results && Array.isArray(vidData.results)) {
                  const trailerObj = vidData.results.find(
                    (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
                  ) || vidData.results[0];
                  if (trailerObj && trailerObj.key) {
                    trailerKey = trailerObj.key;
                  }
                }
              }
            } catch (vErr) {
              // Ignore video fetch errors
            }
          }

          return {
            ...card,
            tmdbId: match.id || match.tmdbId || card.tmdbId,
            title: match.title || match.name || card.title,
            poster_path: match.poster_path || card.poster_path || null,
            backdrop_path: match.backdrop_path || card.backdrop_path || null,
            rating: match.vote_average ? Math.round(match.vote_average * 10) / 10 : (card.rating || 8.0),
            year: (match.release_date || match.first_air_date || card.year || '').slice(0, 4) || '2023',
            overview: card.overview || match.overview || card.matchReason || '',
            genre: card.genre || 'Movie',
            trailer_key: trailerKey,
            trailerUrl: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null,
          };
        }
      } catch (err) {
        console.warn(`Error enriching card "${card?.title}":`, err);
      }
      return card;
    })
  );

  return enriched;
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message = '', language = 'en', history = [], previouslyRecommended = [] } = req.body || {};

  try {
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const isUrdu = language === 'ur';

    if (apiKey) {
      const historySummary = Array.isArray(history) && history.length > 0
        ? history.slice(-8).map((h: any) => `${h.sender.toUpperCase()}: ${h.text}`).join('\n')
        : 'None yet';

      const prevRecList = Array.isArray(previouslyRecommended) && previouslyRecommended.length > 0
        ? previouslyRecommended.join(', ')
        : 'None yet';

      const tmdbCandidates = await fetchTmdbCandidates(message);
      const candidateListStr = tmdbCandidates.length > 0
        ? JSON.stringify(tmdbCandidates, null, 2)
        : 'Use real verified TMDb movies matching the requested genre.';

      const prompt = `You are MoodFlix AI, an elite movie recommendation engine & cinema expert.

CURRENT USER MESSAGE: "${message}"
LANGUAGE SETTING: ${isUrdu ? 'Roman Urdu (Urdu written purely in Latin/English alphabet)' : 'English'}.

CONVERSATION HISTORY:
${historySummary}

PREVIOUSLY RECOMMENDED OR WATCHED TITLES IN THIS SESSION:
${prevRecList}

VERIFIED TMDB MOVIE/SERIES CANDIDATES (REAL DISCOVER DATA):
${candidateListStr}

CRITICAL MOODFLIX AI MANDATES & BEHAVIOR RULES:

1. INTENT RECOGNITION & BEHAVIOR:
   - FOR BROAD OR SPECIFIC RECOMMENDATION REQUESTS (e.g., "I want scary movies", "I want romantic movies", "I want action movies", "I want ghost movies", "Movies like Annabelle"):
     * ALWAYS OUTPUT 6 TO 10 MATCHING MOVIE CARDS IN movieCards IMMEDIATELY!
     * DO NOT ASK QUESTIONS BEFORE SHOWING RESULTS. Always present the movie cards first!
     * In replyText, introduce the list and ALWAYS include a helpful prompt offer at the end:
       - English: "If you want a specific style or sub-genre (like ghost/jinn stories, psychological horror, slasher, or movies like a specific title), tell me and I will refine the recommendations for you!"
       - Roman Urdu: "Agar aap kisi khas kisam ki horror/movie style chahte hain (jaise bhoot/jinn ki kahaniyan, psychological horror, ya Annabelle jaisi movies), to mujhe batayein main mazeed accurately recommend karunga!"

   - FOR MOVIE DETAIL / STORY QUESTIONS (e.g., "What is the story of this movie?", "Tell me its summary", "Who is in this movie?", "Tell me about Annabelle"):
     * Provide COMPLETE MOVIE DETAILS directly in replyText:
       • Short Story Summary / Plot line
       • Genre & Mood
       • Release Year & TMDb Rating
       • Cast / Notable Stars & Director
       • Why it matches the user's taste
     * Set movieCards = [] when answering a detail/story question!

2. ACCURATE TMDB RECOMMENDATION RULES:
   - NEVER INVENT OR HALLUCINATE MOVIE NAMES.
   - SELECT MOVIES STRICTLY FROM THE VERIFIED TMDB CANDIDATES PROVIDED ABOVE.
   - GENRE PURITY RULE:
     * HORROR requests MUST ONLY return horror movies/shows (genre 27).
     * ROMANCE requests MUST ONLY return romance movies/shows (genre 10749).
     * THRILLER requests MUST ONLY return thriller/suspense movies (genre 53).
     * KOREAN requests MUST ONLY return Korean titles.
   - THEMES & SIMILAR MOVIES ("ghost/jinn", "movies like Annabelle"): Select candidates that match supernatural, possession, doll, or demonic themes.
   - NO REPEATS: Do not repeat any title listed in PREVIOUSLY RECOMMENDED OR WATCHED TITLES.
   - Select 6 to 10 best matching items from the candidate list when recommendations are requested.
   - Copy exact tmdbId, title, year, rating, overview, poster_path, and backdrop_path from the candidate object!

3. LANGUAGE & SCRIPT:
   - If language is 'ur' or user writes in Roman Urdu:
     * NEVER USE ARABIC/URDU SCRIPT (no Urdu letters).
     * WRITE EVERYTHING IN PURE ROMAN URDU (Latin alphabet).

OUTPUT FORMAT:
Return strict JSON with:
- replyText: Conversational, friendly, and expert answer.
- movieCards: Array of movie objects (6 to 10 items when recommendations requested, [] when user asked a question). Include tmdbId, title, year, genre, rating, overview, poster_path, backdrop_path, and matchReason.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: { type: Type.STRING },
              movieCards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tmdbId: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    genre: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    overview: { type: Type.STRING },
                    poster_path: { type: Type.STRING },
                    backdrop_path: { type: Type.STRING },
                    matchReason: { type: Type.STRING },
                  },
                  required: ['title', 'matchReason'],
                },
              },
            },
            required: ['replyText'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const result = JSON.parse(jsonText);
      if (result && result.replyText) {
        if (Array.isArray(result.movieCards) && result.movieCards.length > 0) {
          result.movieCards = await enrichMovieCardsWithTmdb(result.movieCards, tmdbCandidates);
        }
        return res.status(200).json(result);
      }
    }
  } catch (error: any) {
    console.warn('AI chat error in serverless:', error);
  }

  const fallbackResult = getSmartChatFallback(message, language, history, previouslyRecommended);
  if (fallbackResult && Array.isArray(fallbackResult.movieCards) && fallbackResult.movieCards.length > 0) {
    fallbackResult.movieCards = await enrichMovieCardsWithTmdb(fallbackResult.movieCards);
  }
  return res.status(200).json(fallbackResult);
}
