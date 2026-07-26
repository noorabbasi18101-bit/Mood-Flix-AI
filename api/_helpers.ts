import { GoogleGenAI, Type } from '@google/genai';

// Fallback key if process.env isn't set
export const DEFAULT_TMDB_KEY = '8e2b834458f29e46a7be7c082ed64b85';

export const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const TMDB_GENRE_MAP: Record<string, { id: number; name: string }> = {
  horror: { id: 27, name: 'Horror' },
  scary: { id: 27, name: 'Horror' },
  ghost: { id: 27, name: 'Horror' },
  bhoot: { id: 27, name: 'Horror' },
  fear: { id: 27, name: 'Horror' },
  creepy: { id: 27, name: 'Horror' },
  slasher: { id: 27, name: 'Horror' },
  supernatural: { id: 27, name: 'Horror' },
  tumbbad: { id: 27, name: 'Horror' },

  romance: { id: 10749, name: 'Romance' },
  romantic: { id: 10749, name: 'Romance' },
  love: { id: 10749, name: 'Romance' },
  pyar: { id: 10749, name: 'Romance' },
  mohabbat: { id: 10749, name: 'Romance' },

  thriller: { id: 53, name: 'Thriller' },
  suspense: { id: 53, name: 'Thriller' },
  investigation: { id: 53, name: 'Thriller' },
  drishyam: { id: 53, name: 'Thriller' },

  scifi: { id: 878, name: 'Sci-Fi' },
  'sci-fi': { id: 878, name: 'Sci-Fi' },
  space: { id: 878, name: 'Sci-Fi' },
  alien: { id: 878, name: 'Sci-Fi' },

  comedy: { id: 35, name: 'Comedy' },
  funny: { id: 35, name: 'Comedy' },
  mazahia: { id: 35, name: 'Comedy' },

  action: { id: 28, name: 'Action' },
  fight: { id: 28, name: 'Action' },

  mystery: { id: 9648, name: 'Mystery' },
  crime: { id: 80, name: 'Crime' },
  drama: { id: 18, name: 'Drama' },
  animation: { id: 16, name: 'Animation' },
  anime: { id: 16, name: 'Animation' },
  fantasy: { id: 14, name: 'Fantasy' },
};

export interface UserCriteria {
  genreId?: number;
  genreName?: string;
  originalLanguage?: string;
  originCountry?: string;
  mediaType: 'movie' | 'tv' | 'both';
}

export function parseUserCriteria(query: string): UserCriteria {
  const msgLower = query.toLowerCase();

  let genreId: number | undefined;
  let genreName: string | undefined;

  for (const [key, val] of Object.entries(TMDB_GENRE_MAP)) {
    if (msgLower.includes(key)) {
      genreId = val.id;
      genreName = val.name;
      break;
    }
  }

  let originalLanguage: string | undefined;
  let originCountry: string | undefined;

  if (msgLower.includes('korean') || msgLower.includes('kdrama') || msgLower.includes('k-drama')) {
    originalLanguage = 'ko';
    originCountry = 'KR';
  } else if (msgLower.includes('indian') || msgLower.includes('bollywood') || msgLower.includes('hindi')) {
    originalLanguage = 'hi';
    originCountry = 'IN';
  } else if (msgLower.includes('south indian') || msgLower.includes('tamil') || msgLower.includes('telugu')) {
    originalLanguage = msgLower.includes('tamil') ? 'ta' : 'te';
  } else if (msgLower.includes('pakistani') || msgLower.includes('urdu')) {
    originalLanguage = 'ur';
    originCountry = 'PK';
  } else if (msgLower.includes('japanese') || msgLower.includes('anime')) {
    originalLanguage = 'ja';
  } else if (msgLower.includes('hollywood') || msgLower.includes('english')) {
    originalLanguage = 'en';
  }

  let mediaType: 'movie' | 'tv' | 'both' = 'movie';
  if (msgLower.includes('series') || msgLower.includes('tv show') || msgLower.includes('kdrama') || msgLower.includes('k-drama')) {
    mediaType = msgLower.includes('movie') ? 'both' : 'tv';
  }

  return { genreId, genreName, originalLanguage, originCountry, mediaType };
}

export async function fetchTmdbCandidates(message: string): Promise<any[]> {
  try {
    const tmdbKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY || DEFAULT_TMDB_KEY;
    const criteria = parseUserCriteria(message);
    const msgLower = message.toLowerCase();

    const fetchUrls: string[] = [];

    const movieMatch = msgLower.match(/like\s+([a-zA-Z0-9\s]+)|about\s+([a-zA-Z0-9\s]+)|tell me about\s+([a-zA-Z0-9\s]+)|is\s+([a-zA-Z0-9\s]+)/i);
    let movieNameQuery = '';
    if (movieMatch) {
      movieNameQuery = (movieMatch[1] || movieMatch[2] || movieMatch[3] || movieMatch[4] || '').trim();
    } else if (msgLower.includes('annabelle')) {
      movieNameQuery = 'annabelle';
    } else if (msgLower.includes('conjuring')) {
      movieNameQuery = 'conjuring';
    } else if (msgLower.includes('tumbbad')) {
      movieNameQuery = 'tumbbad';
    } else if (msgLower.includes('insidious')) {
      movieNameQuery = 'insidious';
    } else if (msgLower.includes('drishyam')) {
      movieNameQuery = 'drishyam';
    }

    if (movieNameQuery && movieNameQuery.length > 2) {
      fetchUrls.push(`https://api.themoviedb.org/3/search/movie?api_key=${tmdbKey}&query=${encodeURIComponent(movieNameQuery)}&page=1`);
    }

    const buildUrl = (type: 'movie' | 'tv', page: number, sortBy = 'popularity.desc', minVotes = 30) => {
      let url = `https://api.themoviedb.org/3/discover/${type}?api_key=${tmdbKey}&page=${page}&sort_by=${sortBy}&vote_count.gte=${minVotes}`;
      if (criteria.genreId) {
        url += `&with_genres=${criteria.genreId}`;
      }
      if (criteria.originalLanguage) {
        url += `&with_original_language=${criteria.originalLanguage}`;
      }
      if (criteria.originCountry) {
        url += `&with_origin_country=${criteria.originCountry}`;
      }
      return url;
    };

    if (criteria.mediaType === 'tv') {
      fetchUrls.push(buildUrl('tv', 1, 'popularity.desc'));
      fetchUrls.push(buildUrl('tv', 2, 'popularity.desc'));
      fetchUrls.push(buildUrl('tv', 1, 'vote_average.desc', 150));
    } else if (criteria.mediaType === 'both') {
      fetchUrls.push(buildUrl('movie', 1, 'popularity.desc'));
      fetchUrls.push(buildUrl('tv', 1, 'popularity.desc'));
    } else {
      fetchUrls.push(buildUrl('movie', 1, 'popularity.desc'));
      fetchUrls.push(buildUrl('movie', 2, 'popularity.desc'));
      fetchUrls.push(buildUrl('movie', 1, 'vote_average.desc', 200));
    }

    const responses = await Promise.all(fetchUrls.map((u) => fetch(u).then((r) => (r.ok ? r.json() : null))));
    let rawResults: any[] = [];
    responses.forEach((r) => {
      if (r && Array.isArray(r.results)) {
        rawResults.push(...r.results);
      }
    });

    if (movieNameQuery && rawResults.length > 0 && rawResults[0]?.id) {
      const topMovieId = rawResults[0].id;
      try {
        const recRes = await fetch(`https://api.themoviedb.org/3/movie/${topMovieId}/recommendations?api_key=${tmdbKey}&page=1`);
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData?.results && Array.isArray(recData.results)) {
            rawResults.unshift(...recData.results);
          }
        }
      } catch (e) {
        // ignore
      }
    }

    const seenIds = new Set<number>();
    const candidates: any[] = [];

    for (const item of rawResults) {
      if (!item || !item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const title = item.title || item.name || item.original_title || item.original_name;
      if (!title) continue;

      if (criteria.genreId && item.genre_ids && Array.isArray(item.genre_ids) && item.genre_ids.length > 0) {
        if (!item.genre_ids.includes(criteria.genreId)) {
          continue;
        }
      }

      candidates.push({
        tmdbId: item.id,
        title: title,
        year: (item.release_date || item.first_air_date || '').slice(0, 4) || '2023',
        rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
        overview: item.overview || '',
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        media_type: item.title ? 'movie' : 'tv',
      });
    }

    if (candidates.length > 0) {
      return candidates.slice(0, 40);
    }
  } catch (err) {
    console.warn('Failed to fetch TMDb candidates:', err);
  }
  return [];
}

export interface FallbackMovieItem {
  title: string;
  year: string;
  genre: string;
  rating: number;
  summaryEn: string;
  summaryUr: string;
  reasonEn: string;
  reasonUr: string;
  tags: string[];
}

export const FALLBACK_DATABASE: FallbackMovieItem[] = [
  {
    title: 'Drishyam',
    year: '2015',
    genre: 'Indian Crime / Suspense Thriller',
    rating: 8.2,
    summaryEn: 'A cable TV operator goes to extreme lengths to protect his family after they accidentally commit a crime while being pursued by a desperate police officer.',
    summaryUr: 'Ek aam cable operator apni family ko bachane ke liye aisi chaal chalta hai ke poori police hairline taftish mein hairan reh jaati hai.',
    reasonEn: 'Unmatched Indian suspense masterpiece with incredible intelligence and mind-boggling twists.',
    reasonUr: 'Indian cinema ki sab se behtareen aur dhang kar dene wali suspense thriller movie.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'drishyam', 'suspense', 'crime'],
  },
  {
    title: 'Andhadhun',
    year: '2018',
    genre: 'Indian Dark Comedy Thriller',
    rating: 8.2,
    summaryEn: 'A blind pianist unknowingly becomes entangled in a series of mysterious events after reporting a murder.',
    summaryUr: 'Ek andha hone ka natak karne wala pianist ek khoon ka gawah ban jata hai aur uski zindagi ajeeb twists mein phans jaati hai.',
    reasonEn: 'Brilliant dark comedy thriller with relentless unpredictable twists and turns.',
    reasonUr: 'Boht hi unpredictable, chhalon aur twists se bhari Indian thriller.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'andhadhun', 'suspense', 'dark comedy'],
  },
  {
    title: 'Ratsasan',
    year: '2018',
    genre: 'Indian Psychological Serial Killer Thriller',
    rating: 8.3,
    summaryEn: 'An aspiring film director becomes a police officer and tracks down a ruthless serial killer targeting schoolgirls.',
    summaryUr: 'Ek film director police officer banta hai aur ek khaufnak serial killer ka peecha karta hai jo school ki larkiyon ko nishana banata hai.',
    reasonEn: 'Nail-biting, relentless Indian thriller with intense BGM and terrifying suspense.',
    reasonUr: 'Har second mein saans rok dene wala khaufnak Indian psychological thriller.',
    tags: ['indian', 'south indian', 'tamil', 'hindi', 'thriller', 'ratsasan', 'serial killer', 'psychological'],
  },
  {
    title: 'Kahaani',
    year: '2012',
    genre: 'Indian Mystery Suspense Thriller',
    rating: 8.1,
    summaryEn: 'A pregnant woman searches for her missing husband in Kolkata during the Durga Puja festival, but everyone denies his existence.',
    summaryUr: 'Ek haamila aurat Kolkata mein apne gayab shohar ko dhoondti hai lekin har koi uske shohar ke hone se inkar karta hai.',
    reasonEn: 'Atmospheric Indian mystery thriller with one of the greatest twist endings in cinema history.',
    reasonUr: 'Kolkata ka khoobsurat atmosphere aur aakhir mein dhang kar dene wala climax twist.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'kahaani', 'mystery', 'suspense'],
  },
  {
    title: 'Badla',
    year: '2019',
    genre: 'Indian Crime Mystery Thriller',
    rating: 7.8,
    summaryEn: 'A young businesswoman finds herself locked in a hotel room with the corpse of her dead lover and hires a prestigious lawyer to defend her.',
    summaryUr: 'Ek ameer larki hotel room mein apne lover ke murder ke ilzam mein phans jaati hai aur ek senior lawyer ke sath baith kar sachai dhoondti hai.',
    reasonEn: 'Engaging Indian courtroom mystery full of deceit and shocking twists.',
    reasonUr: 'Amitabh Bachchan aur Taapsee Pannu ki suspense se bhari mystery thriller.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'badla', 'mystery'],
  },
  {
    title: 'Jab We Met',
    year: '2007',
    genre: 'Indian Romantic Comedy',
    rating: 7.9,
    summaryEn: 'A depressed businessman meets a bubbly chatterbox girl on a train, embarking on an unforgettable journey that changes both their lives.',
    summaryUr: 'Ek udaas businessman train mein ek zinda dil larki Geet se milta hai aur unki zindagi mein naye rang bhar jaate hain.',
    reasonEn: 'Iconic, cheerful, and deeply emotional Indian romantic classic.',
    reasonUr: 'Bollywood ki sab se zinda dil aur pyari romantic comedy.',
    tags: ['indian', 'bollywood', 'hindi', 'romance', 'romantic', 'jab we met', 'comedy', 'love'],
  },
  {
    title: 'Sita Ramam',
    year: '2022',
    genre: 'Indian Romantic Drama',
    rating: 8.6,
    summaryEn: 'An orphaned soldier receives letters from a girl named Sita, starting a poignant love story set against historical events.',
    summaryUr: '1960s mein ek fauji ko Sita ki taraf se khat milte hain aur unki bemisaal mohabbat ki dastan shuru hoti hai.',
    reasonEn: 'Visually stunning, heartfelt epic romance with timeless music and emotion.',
    reasonUr: 'Behad khoobsurat visuals, gano aur jazbaati kahani se bhari hui romantic film.',
    tags: ['indian', 'south indian', 'hindi', 'romance', 'romantic', 'sita ramam', 'love'],
  },
  {
    title: 'The Notebook',
    year: '2004',
    genre: 'Romance / Drama',
    rating: 7.8,
    summaryEn: 'A poor yet passionate young man falls in love with a rich young woman, giving her a sense of freedom, but they are soon separated because of their social differences.',
    summaryUr: 'Ek ghareeb lekin mukhles larka ek ameer larki se mohabbat karta hai, lekin unke darmiyan rishtedar aur halat deewar ban jate hain.',
    reasonEn: 'Timeless romantic classic filled with unforgettable passion and emotional depth.',
    reasonUr: 'Romance ki duniya ki mashhoor tareen aur jazbaati movie.',
    tags: ['romance', 'romantic', 'love', 'drama', 'the notebook', 'emotional', 'hollywood'],
  },
  {
    title: 'Shutter Island',
    year: '2010',
    genre: 'Psychological Thriller',
    rating: 8.2,
    summaryEn: 'A U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.',
    summaryUr: 'Ek U.S. Marshal ek khaufnak hospital se gayab hone wali qatil ki tafteesh karta hai jahan ajeeb raaz khulte hain.',
    reasonEn: 'Unmatched mind-bending atmosphere with a legendary twist ending.',
    reasonUr: 'Sannatay aur zahn ko ghumane wale suspense se bharpoor behtareen movie.',
    tags: ['shutter island', 'psychological', 'thriller', 'mind-bending', 'suspense', 'mystery', 'hollywood'],
  },
  {
    title: 'Tumbbad',
    year: '2018',
    genre: 'Indian Folk Horror Fantasy',
    rating: 8.2,
    summaryEn: 'A mythological story about a family who builds a shrine for Hastar, a monster who should never be worshipped, leading to dark greed and horror.',
    summaryUr: 'Ek khaufnak qadimi kahani jisme ek khandaan Hastar namaj bhoot ki pooja karke laalach aur dehshat ke daldal mein phans jata hai.',
    reasonEn: 'Masterpiece of Indian atmospheric horror with breathtaking rain-soaked visuals and terrifying dread.',
    reasonUr: 'Indian cinema ki sab se behtareen, khaufnak aur gehre suspense wali horror film.',
    tags: ['horror', 'scary', 'tumbbad', 'indian', 'hindi', 'bollywood', 'supernatural', 'folk horror'],
  },
  {
    title: 'The Conjuring',
    year: '2013',
    genre: 'Supernatural Horror',
    rating: 7.5,
    summaryEn: 'Paranormal investigators work to help a family terrorized by a dark presence in their farmhouse.',
    summaryUr: 'Paranormal investigators Ed aur Lorraine Warren ek khaufnak ghar ki madad karte hain.',
    reasonEn: 'Masterful jumpscares, terrifying atmosphere, and iconic horror storytelling.',
    reasonUr: 'Khaufnak atmosphere aur waqai saans rok dene wale jumpscares.',
    tags: ['horror', 'scary', 'ghost', 'conjuring', 'supernatural', 'hollywood'],
  },
  {
    title: 'Interstellar',
    year: '2014',
    genre: 'Sci-Fi / Space Adventure',
    rating: 8.7,
    summaryEn: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival.',
    summaryUr: 'Insaaniyat ko bachane ke liye astronauts wormhole ke zariye doosri galaxies mein naye ghar ki khoj karte hain.',
    reasonEn: 'Visually emotional sci-fi masterpiece exploring space, time, and love.',
    reasonUr: 'Space, time aur jazbaath se bhari hui Christopher Nolan ki shaandar film.',
    tags: ['interstellar', 'sci-fi', 'space', 'nolan', 'epic', 'hollywood'],
  },
  {
    title: 'Parasite',
    year: '2019',
    genre: 'Korean Thriller / Black Comedy',
    rating: 8.5,
    summaryEn: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy and destitute families.',
    summaryUr: 'Ek ghareeb khandaan chalaki se ek ameer ghar mein kaam dhoondta hai lekin aage khaufnak mod aate hain.',
    reasonEn: 'Oscar-winning masterpiece blending dark satire, suspense, and unexpected turns.',
    reasonUr: 'Oscar Jeetne wali zabardast Korean thriller film.',
    tags: ['korean', 'parasite', 'k drama', 'drama', 'thriller'],
  },
];

export function getSmartChatFallback(
  message: string,
  language: string,
  history: any[] = [],
  previouslyRecommended: string[] = []
) {
  const isUrdu = language === 'ur';
  const msgLower = (message || '').toLowerCase();

  const prevSet = new Set((previouslyRecommended || []).map((t: string) => t.toLowerCase().trim()));

  const fullConversationText = [
    ...history.map((h: any) => h.text || ''),
    message
  ].join(' ').toLowerCase();

  const isIndian =
    fullConversationText.includes('indian') ||
    fullConversationText.includes('bollywood') ||
    fullConversationText.includes('hindi') ||
    fullConversationText.includes('south indian') ||
    fullConversationText.includes('drishyam');

  const isKorean =
    fullConversationText.includes('korean') ||
    fullConversationText.includes('k drama') ||
    fullConversationText.includes('k-drama');

  const isHollywood =
    fullConversationText.includes('hollywood') ||
    fullConversationText.includes('english movie');

  let targetGenreKeyword = '';

  const isRomance =
    fullConversationText.includes('romantic') ||
    fullConversationText.includes('romance') ||
    fullConversationText.includes('love story');

  const isHorror =
    fullConversationText.includes('horror') ||
    fullConversationText.includes('scary') ||
    fullConversationText.includes('ghost');

  const isThriller =
    fullConversationText.includes('thriller') ||
    fullConversationText.includes('suspense') ||
    fullConversationText.includes('shutter island');

  const isComedy =
    fullConversationText.includes('funny') ||
    fullConversationText.includes('comedy');

  const isSciFi =
    fullConversationText.includes('sci-fi') ||
    fullConversationText.includes('scifi') ||
    fullConversationText.includes('space');

  if (isRomance) targetGenreKeyword = 'romance';
  else if (isHorror) targetGenreKeyword = 'horror';
  else if (isThriller) targetGenreKeyword = 'thriller';
  else if (isComedy) targetGenreKeyword = 'comedy';
  else if (isKorean) targetGenreKeyword = 'korean';
  else if (isSciFi) targetGenreKeyword = 'sci-fi';

  const isWatchedNotice =
    msgLower.includes('watched') ||
    msgLower.includes('seen') ||
    msgLower.includes('dekh li');

  const isExplicitRecommendationRequest =
    isWatchedNotice ||
    msgLower.includes('recommend') ||
    msgLower.includes('suggest') ||
    msgLower.includes('more') ||
    msgLower.includes('aur') ||
    msgLower.includes('show me') ||
    msgLower.includes('give me');

  const isQuestion =
    !isWatchedNotice && (
      msgLower.includes('?') ||
      msgLower.includes('is ') ||
      msgLower.includes('what') ||
      msgLower.includes('how') ||
      msgLower.includes('about') ||
      msgLower.includes('summary') ||
      msgLower.includes('plot') ||
      msgLower.includes('tell me')
    );

  if (isQuestion && !isExplicitRecommendationRequest) {
    let answerEn = '';
    let answerUr = '';

    if (msgLower.includes('tumbbad')) {
      answerEn = 'Tumbbad (2018) is an acclaimed Indian folk horror film about a family who builds a shrine for Hastar, a forbidden demon of greed, uncovering dark wealth at terrifying costs.';
      answerUr = 'Tumbbad (2018) ek mashhoor Indian folk horror film hai jisme ek khandaan lalach mein aakar Hastar naam ke bhoot ka khazana dhoondta hai aur dehshat ka shikar hota hai.';
    } else if (msgLower.includes('badla')) {
      answerEn = 'Badla is an Indian crime mystery thriller revolving around a murder mystery and intense interrogation.';
      answerUr = 'Badla ek zabardast Indian crime mystery aur murder investigation thriller hai.';
    } else {
      answerEn = 'Tell me which movie title you would like to know about and I will explain the story, cast, and plot details!';
      answerUr = 'Aap kis film ke baare mein poochna chahte hain? Naam batayein aur main aap ko bina spoilers ke summary bata doon ga!';
    }

    return {
      replyText: isUrdu ? answerUr : answerEn,
      movieCards: [],
    };
  }

  let candidates = FALLBACK_DATABASE.filter((m) => !prevSet.has(m.title.toLowerCase()));

  if (isIndian) {
    const ind = candidates.filter((m) => m.tags.includes('indian'));
    if (ind.length > 0) candidates = ind;
  } else if (isKorean) {
    const kor = candidates.filter((m) => m.tags.includes('korean'));
    if (kor.length > 0) candidates = kor;
  }

  if (targetGenreKeyword) {
    const gen = candidates.filter((m) => m.tags.includes(targetGenreKeyword));
    if (gen.length > 0) candidates = gen;
  }

  let selected = candidates.slice(0, 5);
  if (selected.length === 0) {
    selected = FALLBACK_DATABASE.slice(0, 5);
  }

  const promptMsgEn = isUrdu
    ? "Agar aap kisi khas kisam ki movie style chahte hain, to mujhe batayein main mazeed accurately recommend karunga!"
    : "If you want a specific style or sub-genre, tell me and I will refine the recommendations for you!";

  const movieCards = selected.map((m) => ({
    title: m.title,
    year: m.year,
    genre: m.genre,
    rating: m.rating,
    overview: isUrdu ? m.summaryUr : m.summaryEn,
    matchReason: isUrdu ? m.reasonUr : m.reasonEn,
  }));

  return {
    replyText: isUrdu
      ? `Aap ki request ke hisab se ye top recommendations hain:\n\n${promptMsgEn}`
      : `Based on your request, here are top recommendations curated specifically for you:\n\n${promptMsgEn}`,
    movieCards,
  };
}
