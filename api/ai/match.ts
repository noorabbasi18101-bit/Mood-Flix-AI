import { Type } from '@google/genai';
import {
  ai,
  apiKey,
  fetchTmdbCandidates,
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

  const { mood = '', language = 'en' } = req.body || {};

  try {
    if (!mood || typeof mood !== 'string') {
      return res.status(400).json({ error: 'Mood query is required' });
    }

    const isUrdu = language === 'ur';

    if (apiKey) {
      const tmdbCandidates = await fetchTmdbCandidates(mood);
      const candidateListStr = tmdbCandidates.length > 0
        ? JSON.stringify(tmdbCandidates, null, 2)
        : 'Use real verified TMDb movies matching the requested genre.';

      const prompt = `You are MoodFlix AI, an elite movie recommendation engine.
The user describes their mood: "${mood}".
Active user language context: ${isUrdu ? 'Roman Urdu (Urdu written in Latin script)' : 'English'}.

VERIFIED TMDB MOVIE/SERIES CANDIDATES (REAL DISCOVER DATA):
${candidateListStr}

CRITICAL MANDATES:
1. Extract Genre, Country, Language, and Mood from "${mood}".
2. SELECT 6 TO 10 MOVIES STRICTLY FROM THE TMDB CANDIDATES LIST ABOVE. DO NOT INVENT MOVIE NAMES.
3. GENRE PURITY MANDATE:
   - HORROR: Only Horror titles.
   - ROMANCE: Only Romance titles.
   - K-DRAMA: Only Korean titles.
4. Copy exact tmdbId, title, year, rating, overview, poster_path, backdrop_path from the candidate object!
5. Provide explanations in BOTH English (matchReasonEn) and Roman Urdu (matchReasonUrdu).
6. For Roman Urdu: DO NOT USE URDU SCRIPT. Write purely in Roman Urdu using English alphabet.
7. Return strict JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              aiSummaryEn: { type: Type.STRING },
              aiSummaryUrdu: { type: Type.STRING },
              recommendedMovies: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    tmdbId: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    overview: { type: Type.STRING },
                    poster_path: { type: Type.STRING },
                    backdrop_path: { type: Type.STRING },
                    matchScore: { type: Type.INTEGER },
                    matchReasonEn: { type: Type.STRING },
                    matchReasonUrdu: { type: Type.STRING },
                    moodTags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: ['title', 'matchScore', 'matchReasonEn', 'matchReasonUrdu', 'moodTags'],
                },
              },
            },
            required: ['aiSummaryEn', 'aiSummaryUrdu', 'recommendedMovies'],
          },
        },
      });

      const jsonText = response.text?.trim() || '{}';
      const result = JSON.parse(jsonText);

      return res.status(200).json(result);
    }
  } catch (error: any) {
    console.warn('AI match error in serverless:', error);
  }

  return res.status(200).json({
    aiSummaryEn: `Here are top recommendations tailored for your mood: "${mood}"`,
    aiSummaryUrdu: `Aap ke mood "${mood}" ke hisab se ye top recommendations hain:`,
    recommendedMovies: [
      {
        tmdbId: 27205,
        title: 'Inception',
        year: '2010',
        rating: 8.4,
        poster_path: '/oYuLE1S1S3P22C929S3A37C1S32.jpg',
        backdrop_path: '/8ZTVqvKDQ8P2D1yS80mX.jpg',
        overview: 'Cobb, a skilled thief who commits corporate espionage by infiltrating subconscious dreams.',
        matchScore: 98,
        matchReasonEn: 'Mind-bending psychological masterpiece matching your complex state of mind.',
        matchReasonUrdu: 'Agar aap mind-bending aur zahn ko ghumane wali suspense movies pasand karte hain to ye movie perfect hai.',
        moodTags: ['Mind-Bending', 'Intense', 'Sci-Fi'],
      },
      {
        tmdbId: 496243,
        title: 'Parasite',
        year: '2019',
        rating: 8.5,
        poster_path: '/7IiT3883aL.jpg',
        backdrop_path: '/hiE4U611.jpg',
        overview: 'All unemployed, Ki-taeks family takes peculiar interest in the wealthy Parks family.',
        matchScore: 95,
        matchReasonEn: 'Dark social thriller filled with surprising turns and sharp tension.',
        matchReasonUrdu: 'Agar aap suspense aur ajeeb o ghareeb twists pasand karte hain to Parasite zaroor dekhein.',
        moodTags: ['Korean', 'Thriller', 'Dark Comedy'],
      },
    ],
  });
}
