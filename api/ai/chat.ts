import { Type } from '@google/genai';
import {
  ai,
  apiKey,
  fetchTmdbCandidates,
  getSmartChatFallback,
} from '../_helpers';

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
                  required: ['tmdbId', 'title', 'genre', 'overview', 'matchReason'],
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
        return res.status(200).json(result);
      }
    }
  } catch (error: any) {
    console.warn('AI chat error in serverless:', error);
  }

  const fallbackResult = getSmartChatFallback(message, language, history, previouslyRecommended);
  return res.status(200).json(fallbackResult);
}
