import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Demo fallback TMDb Key if user hasn't set one yet
const DEFAULT_TMDB_KEY = '8e2b834458f29e46a7be7c082ed64b85';

// API Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'MoodFlix AI' });
});

// Proxy for TMDb to keep key secure and handle CORS/Rate limits
app.get('/api/tmdb', async (req, res) => {
  try {
    const endpoint = req.query.endpoint as string;
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    const tmdbKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY || DEFAULT_TMDB_KEY;
    
    // Copy query params except endpoint
    const queryParams = new URLSearchParams();
    queryParams.set('api_key', tmdbKey);

    Object.keys(req.query).forEach((key) => {
      if (key !== 'endpoint') {
        queryParams.set(key, String(req.query[key]));
      }
    });

    const targetUrl = `https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`;
    const tmdbRes = await fetch(targetUrl);

    if (!tmdbRes.ok) {
      return res.status(tmdbRes.status).json({ error: `TMDb Error ${tmdbRes.statusText}` });
    }

    const data = await tmdbRes.json();
    return res.json(data);
  } catch (error) {
    console.error('TMDb proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from TMDb' });
  }
});

// FALLBACK MOVIE & DRAMA KNOWLEDGEBASE FOR SMART AI ENGINE
interface FallbackMovieItem {
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

const FALLBACK_DATABASE: FallbackMovieItem[] = [
  // Indian Thrillers
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
    title: 'Ugly',
    year: '2013',
    genre: 'Indian Psychological Dark Thriller',
    rating: 7.9,
    summaryEn: 'When a 10-year-old girl disappears, her father and stepfather accuse each other while human greed unravels.',
    summaryUr: 'Ek bachi ke gayab hone par har koi apni zati garaz aur laalach mein ajeeb o ghareeb khaufnak khel khelta hai.',
    reasonEn: 'Raw, gritty, dark masterpiece by Anurag Kashyap.',
    reasonUr: 'Anurag Kashyap ki dark aur gehra dhang kar dene wali Indian thriller.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'ugly', 'dark', 'psychological'],
  },
  {
    title: 'A Wednesday',
    year: '2008',
    genre: 'Indian Suspense Drama Thriller',
    rating: 8.1,
    summaryEn: 'A retiring police officer recounts the most astounding day of his career when an anonymous caller threatens to detonate bombs in Mumbai.',
    summaryUr: 'Mumbai mein ek aam shakhs police ko phone karke bombs blast karne ki dhamki deta hai aur badle mein terrorists ki azaadi maangta hai.',
    reasonEn: 'Powerful, fast-paced Indian suspense thriller driven by incredible acting.',
    reasonUr: 'Behad tez paimanay par chalne wali aur aakhir tak baandhe rakhne wali film.',
    tags: ['indian', 'bollywood', 'hindi', 'thriller', 'a wednesday', 'suspense', 'crime'],
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

  // Indian Romance
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
    title: 'Dilwale Dulhania Le Jayenge',
    year: '2019',
    genre: 'Indian Romantic Drama',
    rating: 8.0,
    summaryEn: 'Raj and Simran meet on a trip across Europe and fall in love, but must win Simran’s traditional father’s approval.',
    summaryUr: 'Raj aur Simran Europe trip par milte hain aur Simran ke walid ki zidd ke bawajood apni mohabbat jeetne ki koshish karte hain.',
    reasonEn: 'The undisputed legendary benchmark of Indian cinema romance.',
    reasonUr: 'Indian cinema ki tareekh ki sab se badi romantic classic movie.',
    tags: ['indian', 'bollywood', 'hindi', 'romance', 'romantic', 'ddlj', 'classic', 'love'],
  },

  // Romance & Romantic Drama (Hollywood / Global)
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
    title: 'Pride & Prejudice',
    year: '2005',
    genre: 'Romantic Drama',
    rating: 7.8,
    summaryEn: 'Sparks fly when spirited Elizabeth Bennet meets single, rich, and proud Mr. Darcy.',
    summaryUr: 'Elizabeth Bennet aur Mr. Darcy ke darmiyan shuruaati galat fehmiyon ke baad ek khoobsurat mohabbat ki dastan shuru hoti hai.',
    reasonEn: 'Masterpiece of romantic literature brought to screen with breathtaking dialogue and chemistry.',
    reasonUr: 'Mohabbat, garoor aur jazbaath se bhari khoobsurat romantic film.',
    tags: ['romance', 'romantic', 'pride', 'prejudice', 'love', 'classic', 'hollywood'],
  },
  {
    title: 'Me Before You',
    year: '2016',
    genre: 'Romantic Drama',
    rating: 7.4,
    summaryEn: 'A girl in a small town forms an unlikely bond with a recently-paralyzed man she is taking care of.',
    summaryUr: 'Ek zinda dil larki ek maazoor ameer shakhs ki dekh bhaal karti hai aur dono ki zindagi hamesha ke liye badal jaati hai.',
    reasonEn: 'Deeply touching story about love, companionship, and finding joy in life.',
    reasonUr: 'Dil ko chhoo lene wali aur jazbaati romantic dastan.',
    tags: ['romance', 'romantic', 'me before you', 'love', 'emotional', 'hollywood'],
  },
  {
    title: 'The Vow',
    year: '2012',
    genre: 'Romantic Drama',
    rating: 6.8,
    summaryEn: 'A car accident puts Paige in a coma. When she wakes up with severe memory loss, her husband Leo works to win her heart again.',
    summaryUr: 'Ek haadse mein larki ki yaaddasht chali jaati hai, aur uska shohar uski mohabbat dobara jeetne ki koshish karta hai.',
    reasonEn: 'Heartwarming true story of unconditional love and second chances.',
    reasonUr: 'Sachi mohabbat aur yaaddasht kho jaane ke baad dobara pyar jeetne ki kahani.',
    tags: ['romance', 'romantic', 'the vow', 'love', 'memory', 'hollywood'],
  },
  {
    title: 'A Walk to Remember',
    year: '2002',
    genre: 'Romantic Drama',
    rating: 7.3,
    summaryEn: 'Two North Carolina teens, Landon Carter and Jamie Sullivan, are thrown together after Landon gets into trouble.',
    summaryUr: 'Ek laparwah larka ek nek aur Shareef larki se milkar bilkul badal jata hai aur us se sachi mohabbat kar baithta hai.',
    reasonEn: 'Pure, emotional, and unforgettable teenage romantic classic.',
    reasonUr: 'Behad khoobsurat aur jazbaati love story.',
    tags: ['romance', 'romantic', 'a walk to remember', 'love', 'classic', 'hollywood'],
  },
  {
    title: 'La La Land',
    year: '2016',
    genre: 'Romantic Musical Drama',
    rating: 8.0,
    summaryEn: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.',
    summaryUr: 'Los Angeles mein ek aspiring actress aur jazz musician ek dusre se pyar karte hain jab ke apne khwab poore karne ki koshish karte hain.',
    reasonEn: 'Modern cinematic romantic masterpiece with incredible music, visual style, and realistic love.',
    reasonUr: 'Behtareen gaane, khoobsurat visuals aur dilchasp romantic kahani.',
    tags: ['romance', 'romantic', 'la la land', 'love', 'musical', 'hollywood'],
  },
  {
    title: 'About Time',
    year: '2013',
    genre: 'Romantic Sci-Fi Drama',
    rating: 7.8,
    summaryEn: 'At the age of 21, Tim discovers he can travel in time and change what happens in his own life. His decision to make his world a better place by getting a girlfriend turns out not to be that easy.',
    summaryUr: '21 saal ki umar mein Tim ko pata chalta hai ke wo waqt mein peeche ja sakta hai, aur wo is taaqat ko apni mohabbat dhoondne ke liye istemal karta hai.',
    reasonEn: 'Warm, beautiful, uplifting romantic film about life, family, and precious moments.',
    reasonUr: 'Time travel aur mohabbat se bhari behad pyari aur relaxing film.',
    tags: ['romance', 'romantic', 'about time', 'love', 'feel good', 'hollywood'],
  },

  // Psychological Thrillers / Mind Benders (Hollywood)
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
    title: 'Black Swan',
    year: '2010',
    genre: 'Psychological Thriller',
    rating: 8.0,
    summaryEn: 'A committed dancer wins the lead role in Swan Lake, but struggles to maintain her sanity as pressure builds.',
    summaryUr: 'Ek dancer Swan Lake ke role ke liye apni mansik halat kho baithti hai aur khaufnak hallucinations dekhti hai.',
    reasonEn: 'Incredible psychological tension and dark artistic pressure similar to Shutter Island.',
    reasonUr: 'Shutter Island ki tarah gehra suspense aur mind-bending madness.',
    tags: ['shutter island', 'psychological', 'thriller', 'dark', 'madness', 'swan', 'hollywood'],
  },
  {
    title: 'The Prestige',
    year: '2006',
    genre: 'Mystery / Sci-Fi Thriller',
    rating: 8.5,
    summaryEn: 'After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion.',
    summaryUr: '1890s London mein do jadugar ek dusre se aage nikalne aur ultimate illusion banane ke liye kisi bhi had tak jaate hain.',
    reasonEn: 'Christopher Nolan directing intense obsession, rivalry, and brilliant plot twists.',
    reasonUr: 'Obsession aur shock plot twists se bhari hui zabardast movie.',
    tags: ['shutter island', 'prestige', 'magic', 'nolan', 'mind-bending', 'thriller', 'hollywood'],
  },
  {
    title: 'Gone Girl',
    year: '2014',
    genre: 'Psychological Crime Thriller',
    rating: 8.1,
    summaryEn: 'With his wife’s disappearance having become the focus of an intense media circus, a man sees the spotlight turned on him.',
    summaryUr: 'Ek shakhs ki biwi gayab ho jaati hai aur media ke dabao mein har ungli uspar uthti hai, lekin sachai kuch aur hoti hai.',
    reasonEn: 'Chilling, unpredictable twists directed by David Fincher.',
    reasonUr: 'David Fincher ki directed hairan kun suspense aur twists wali film.',
    tags: ['shutter island', 'gone girl', 'thriller', 'mystery', 'crime', 'psychological', 'hollywood'],
  },
  {
    title: 'Prisoners',
    year: '2013',
    genre: 'Crime Drama Thriller',
    rating: 8.1,
    summaryEn: 'When his daughter and her friend go missing, a desperate father takes matters into his own hands.',
    summaryUr: 'Beti ke aghra hone par ek majboor baap khud qanoon haath mein leta hai aur sachai dhoondta hai.',
    reasonEn: 'Relentless suspense, moral conflict, and gripping performances by Hugh Jackman and Jake Gyllenhaal.',
    reasonUr: 'Zabardast acting aur har second mein barhta hua suspense.',
    tags: ['prisoners', 'thriller', 'crime', 'denis villeneuve', 'intense', 'psychological', 'hollywood'],
  },
  {
    title: 'Se7en',
    year: '1995',
    genre: 'Dark Crime Mystery',
    rating: 8.6,
    summaryEn: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.',
    summaryUr: 'Do detectives ek aise serial killer ka peecha karte hain jo 7 gunahon par mabni qatl karta hai.',
    reasonEn: 'Dark, gritty masterpiece with an iconic climax.',
    reasonUr: 'Dark, suspenseful aur ending par dhang reh jaane wali movie.',
    tags: ['se7en', 'david fincher', 'serial killer', 'crime', 'mystery', 'thriller', 'hollywood'],
  },

  // Horror
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
    title: 'Hereditary',
    year: '2018',
    genre: 'Psychological Horror',
    rating: 7.3,
    summaryEn: 'A grieving family is haunted by tragic and disturbing occurrences after the matriarch passes away.',
    summaryUr: 'Dadi ke inteqal ke baad ek khandaan ke sath ajeeb aur khaufnak shaitani waqiath hone lagte hain.',
    reasonEn: 'Deeply unsettling psychological dread and shocking modern horror execution.',
    reasonUr: 'Zahn ko hilakar rakh dene wala gehra khauf aur disturbing story.',
    tags: ['horror', 'hereditary', 'scary', 'disturbing', 'psychological', 'hollywood'],
  },
  {
    title: 'Get Out',
    year: '2017',
    genre: 'Psychological Horror Thriller',
    rating: 7.8,
    summaryEn: 'A young African-American visits his white girlfriend’s parents for the weekend, where uncanny secrets unfold.',
    summaryUr: 'Ek larka apni girlfriend ke ghar walon se milne jata hai lekin wahan boht hi ajeeb aur khaufnak raaz pata chalte hain.',
    reasonEn: 'Brilliant social satire mixed with tense psychological horror.',
    reasonUr: 'Zabardast suspense, mystery aur dhang reh jaane wala concept.',
    tags: ['horror', 'get out', 'thriller', 'mystery', 'scary', 'hollywood'],
  },
  {
    title: 'A Quiet Place',
    year: '2018',
    genre: 'Horror / Thriller',
    rating: 7.5,
    summaryEn: 'A family must navigate their lives in silence to avoid mysterious creatures that hunt by sound.',
    summaryUr: 'Ek khandaan ko bilkul khamoshi mein rehna hota hai taake wo aawaz se shikar karne wale khaufnak monsters se bach sakein.',
    reasonEn: 'Incredible nail-biting silence tension and heart-pounding survival.',
    reasonUr: 'Sannatay se bhara hua saans rok dene wala khauf.',
    tags: ['horror', 'scary', 'a quiet place', 'monsters', 'thriller', 'hollywood'],
  },

  // Sci-Fi
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
    title: 'Inception',
    year: '2010',
    genre: 'Sci-Fi / Psychological Thriller',
    rating: 8.8,
    summaryEn: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    summaryUr: 'Ek chor jo khwabon ke zariye raaz churata hai, usko dimaagh mein naya khayal daalne ka mission milta hai.',
    reasonEn: 'Mind-bending sci-fi heist with iconic visuals.',
    reasonUr: 'Khwabon ki duniya aur dimaagh ghumane wala master plan.',
    tags: ['inception', 'sci-fi', 'nolan', 'mind-bending', 'thriller', 'hollywood'],
  },

  // Comedy
  {
    title: 'Superbad',
    year: '2007',
    genre: 'Comedy',
    rating: 7.6,
    summaryEn: 'Two high school friends plan a booze-filled party before heading off to different colleges.',
    summaryUr: 'Do high school dost ek party ke liye boht si funny mushkilon ka samna karte hain.',
    reasonEn: 'Hilarious comedy about friendship and teenage shenanigans.',
    reasonUr: 'Hanse hanse kar pet mein dard kar dene wali funny comedy.',
    tags: ['funny', 'comedy', 'superbad', 'hilarious', 'hollywood'],
  },
  {
    title: 'The Hangover',
    year: '2009',
    genre: 'Comedy',
    rating: 7.7,
    summaryEn: 'Three buddies wake up from a bachelor party in Las Vegas with no memory of the previous night and the groom missing.',
    summaryUr: 'Las Vegas mein bachelor party ke baad 3 dost subah uthte hain lekin unhe kuch yaad nahi hota aur dulha gayab hota hai.',
    reasonEn: 'Non-stop comedy investigation with outrageous laugh-out-loud moments.',
    reasonUr: 'Har scene mein zabardast laugh-out-loud comedy.',
    tags: ['funny', 'hangover', 'comedy', 'party', 'hollywood'],
  },

  // K-Drama / Korean
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
  {
    title: 'Squid Game',
    year: '2021',
    genre: 'Korean Survival Drama',
    rating: 8.0,
    summaryEn: 'Hundreds of cash-strapped players accept a strange invitation to compete in children’s games for a tempting prize.',
    summaryUr: 'Boht se qarzdar log ek khatarnak game khelne ke liye jama hote hain jahan harna matlab maut hai.',
    reasonEn: 'High stakes survival drama that captivated the world.',
    reasonUr: 'World famous high stakes Korean survival thriller series.',
    tags: ['korean', 'squid game', 'k drama', 'survival'],
  },
];

function getSmartChatFallback(
  message: string,
  language: string,
  history: any[] = [],
  previouslyRecommended: string[] = []
) {
  const isUrdu = language === 'ur';
  const msgLower = (message || '').toLowerCase();

  // Normalize previously recommended titles
  const prevSet = new Set((previouslyRecommended || []).map((t: string) => t.toLowerCase().trim()));

  // Extract full conversation history string to detect ongoing established genre/context
  const fullConversationText = [
    ...history.map((h: any) => h.text || ''),
    message
  ].join(' ').toLowerCase();

  // Detect Country / Industry / Language filters
  const isIndian =
    fullConversationText.includes('indian') ||
    fullConversationText.includes('bollywood') ||
    fullConversationText.includes('hindi') ||
    fullConversationText.includes('deshi') ||
    fullConversationText.includes('south indian') ||
    fullConversationText.includes('drishyam') ||
    fullConversationText.includes('andhadhun') ||
    fullConversationText.includes('ratsasan');

  const isKorean =
    fullConversationText.includes('korean') ||
    fullConversationText.includes('k drama') ||
    fullConversationText.includes('k-drama') ||
    fullConversationText.includes('korea');

  const isHollywood =
    fullConversationText.includes('hollywood') ||
    fullConversationText.includes('american') ||
    fullConversationText.includes('english movie');

  // Detect explicit or historic genre focus
  let targetGenreKeyword = '';

  const isRomance =
    fullConversationText.includes('romantic') ||
    fullConversationText.includes('romance') ||
    fullConversationText.includes('love story') ||
    fullConversationText.includes('love movie');

  const isHorror =
    fullConversationText.includes('horror') ||
    fullConversationText.includes('scary') ||
    fullConversationText.includes('ghost');

  const isThriller =
    fullConversationText.includes('thriller') ||
    fullConversationText.includes('psychological') ||
    fullConversationText.includes('suspense') ||
    fullConversationText.includes('shutter island') ||
    fullConversationText.includes('drishyam');

  const isComedy =
    fullConversationText.includes('funny') ||
    fullConversationText.includes('comedy') ||
    fullConversationText.includes('laugh');

  const isSciFi =
    fullConversationText.includes('sci-fi') ||
    fullConversationText.includes('scifi') ||
    fullConversationText.includes('space') ||
    fullConversationText.includes('interstellar');

  if (isRomance) targetGenreKeyword = 'romance';
  else if (isHorror) targetGenreKeyword = 'horror';
  else if (isThriller) targetGenreKeyword = 'thriller';
  else if (isComedy) targetGenreKeyword = 'comedy';
  else if (isKorean) targetGenreKeyword = 'korean';
  else if (isSciFi) targetGenreKeyword = 'sci-fi';

  const isMoreRequest =
    msgLower.includes('aur') ||
    msgLower.includes('more') ||
    msgLower.includes('dekh li') ||
    msgLower.includes('seen') ||
    msgLower.includes('aage') ||
    msgLower.includes('other') ||
    msgLower.includes('give me more') ||
    msgLower.includes('batao');

  // Check if message is a question/discussion vs recommendation request
  const isWatchedNotice =
    msgLower.includes('watched') ||
    msgLower.includes('seen') ||
    msgLower.includes('dekh li') ||
    msgLower.includes('dekh li hain') ||
    msgLower.includes('dekh rakhi');

  const isExplicitRecommendationRequest =
    isWatchedNotice ||
    msgLower.includes('recommend') ||
    msgLower.includes('suggest') ||
    msgLower.includes('more') ||
    msgLower.includes('aur') ||
    msgLower.includes('list') ||
    msgLower.includes('give me') ||
    msgLower.includes('show me') ||
    msgLower.includes('batao') ||
    msgLower.includes('aage');

  const isQuestion =
    !isWatchedNotice && (
      msgLower.includes('?') ||
      msgLower.includes('is ') ||
      msgLower.includes('was ') ||
      msgLower.includes('what') ||
      msgLower.includes('why') ||
      msgLower.includes('how') ||
      msgLower.includes('scary') ||
      msgLower.includes('about') ||
      msgLower.includes('summary') ||
      msgLower.includes('plot') ||
      msgLower.includes('kya ') ||
      msgLower.includes('kesi ') ||
      msgLower.includes('kaisi ') ||
      msgLower.includes('kyun ') ||
      msgLower.includes('kab ') ||
      msgLower.includes('konsi ') ||
      msgLower.includes('tell me') ||
      msgLower.includes('explain')
    );

  // If user is asking a conversational question or discussing a movie (and NOT explicitly asking for new recommendations), answer directly without sending movie cards!
  if (isQuestion && !isExplicitRecommendationRequest) {
    let answerEn = '';
    let answerUr = '';

    if (msgLower.includes('tumbbad')) {
      if (msgLower.includes('scary') || msgLower.includes('horror') || msgLower.includes('kesi') || msgLower.includes('kaisi') || msgLower.includes('how')) {
        answerEn = 'Yes! Tumbbad is a critically acclaimed Indian folk horror movie. It is deeply atmospheric and scary, relying on psychological dread, rain-soaked visuals, and dark folklore rather than cheap jumpscares.';
        answerUr = 'Haan, Tumbbad behad khaufnak aur zabardast Indian folk horror film hai. Ye gehre suspense, dehshat aur qadimi bhoot ki kahani par mabni hai.';
      } else {
        answerEn = 'Tumbbad (2018) is an acclaimed Indian folk horror film about a family who builds a shrine for Hastar, a forbidden demon of greed, uncovering dark wealth at terrifying costs.';
        answerUr = 'Tumbbad (2018) ek mashhoor Indian folk horror film hai jisme ek khandaan lalach mein aakar Hastar naam ke bhoot ka khazana dhoondta hai aur dehshat ka shikar hota hai.';
      }
    } else if (msgLower.includes('badla')) {
      if (msgLower.includes('horror')) {
        answerEn = 'No. Badla is an Indian crime mystery thriller, not a horror movie. It revolves around a murder mystery and intense courtroom interrogation.';
        answerUr = 'Nahi, Badla horror movie nahi hai. Badla ek zabardast Indian crime mystery aur murder investigation thriller hai jisme Amitabh Bachchan aur Taapsee Pannu hain.';
      } else if (msgLower.includes('scary')) {
        answerEn = 'Badla is not scary in a horror or ghost sense. It relies on psychological suspense, investigation, and plot twists rather than supernatural jumpscares.';
        answerUr = 'Badla khaufnak ya bhoot wali movie nahi hai. Ye suspense, dimaaghi chaalon aur mystery se bhari hui film hai.';
      } else {
        answerEn = 'Badla follows Naina Sethi, a young businesswoman accused of murdering her lover in a locked hotel room, who hires a veteran lawyer to prepare her defense.';
        answerUr = 'Badla ki kahani ek ameer larki ke baare mein hai jo hotel room mein apne lover ke murder ke ilzam mein phans jaati hai aur ek senior lawyer ke sath sachai dhoondti hai.';
      }
    } else if (msgLower.includes('scary')) {
      answerEn = 'Whether a movie is scary depends on its genre! Horror movies like The Conjuring or Tumbbad rely on terrifying atmosphere and ghosts, while thrillers focus on suspense.';
      answerUr = 'Tumbbad aur The Conjuring jaisi horror movies dehshat aur bhoot par mabni hoti hain, jab ke thrillers mein suspense aur mind games hote hain.';
    } else if (msgLower.includes('about') || msgLower.includes('story') || msgLower.includes('summary') || msgLower.includes('kya hai') || msgLower.includes('tell me') || msgLower.includes('explain')) {
      const matchedMovie = FALLBACK_DATABASE.find((m) => msgLower.includes(m.title.toLowerCase()));
      if (matchedMovie) {
        answerEn = `"${matchedMovie.title}" (${matchedMovie.year}) is a ${matchedMovie.genre} (Rated ${matchedMovie.rating}/10). Summary: ${matchedMovie.summaryEn}`;
        answerUr = `"${matchedMovie.title}" (${matchedMovie.year}) ek ${matchedMovie.genre} film hai. Summary: ${matchedMovie.summaryUr}`;
      } else {
        answerEn = 'Tell me which movie title you would like to know about and I will explain the story and plot without spoilers!';
        answerUr = 'Aap kis film ke baare mein poochna chahte hain? Naam batayein aur main aap ko bina spoilers ke summary bata doon ga!';
      }
    } else if (msgLower.includes('who are you') || msgLower.includes('what can you do') || msgLower.includes('kya kar sakte')) {
      answerEn = 'I am your AI movie matchmaker! I can answer questions about movies, explain plots, compare titles, or recommend personalized movies when you ask.';
      answerUr = 'Main aap ka AI movie companion hoon! Main aap ke movie questions ke jawab de sakta hoon aur aap ki pasand par movies recommend kar sakta hoon.';
    } else {
      answerEn = 'I am right here! Ask me any question about movie plots, genres, endings, or let me know if you would like new recommendations.';
      answerUr = 'Main aap ki madad ke liye hazir hoon! Movie plots, genres ya endings ke baare mein sawal poochein ya recommendations maangyein.';
    }

    return {
      replyText: isUrdu ? answerUr : answerEn,
      movieCards: [], // DO NOT send movie cards when user asks a question!
    };
  }

  // Filter candidates not previously recommended
  let candidates = FALLBACK_DATABASE.filter((m) => !prevSet.has(m.title.toLowerCase()));

  // 1. Strict Country / Industry Filter
  if (isIndian) {
    const indianCandidates = candidates.filter((m) =>
      m.tags.includes('indian') || m.tags.includes('bollywood') || m.genre.toLowerCase().includes('indian')
    );
    if (indianCandidates.length > 0) {
      candidates = indianCandidates;
    }
  } else if (isKorean) {
    const koreanCandidates = candidates.filter((m) =>
      m.tags.includes('korean') || m.genre.toLowerCase().includes('korean')
    );
    if (koreanCandidates.length > 0) {
      candidates = koreanCandidates;
    }
  } else if (isHollywood) {
    const hollywoodCandidates = candidates.filter((m) =>
      m.tags.includes('hollywood') || (!m.tags.includes('indian') && !m.tags.includes('korean'))
    );
    if (hollywoodCandidates.length > 0) {
      candidates = hollywoodCandidates;
    }
  }

  // 2. Strict Genre Filter
  if (targetGenreKeyword) {
    const genreFiltered = candidates.filter((m) =>
      m.tags.some((tag) => tag.includes(targetGenreKeyword)) ||
      m.genre.toLowerCase().includes(targetGenreKeyword)
    );
    if (genreFiltered.length > 0) {
      candidates = genreFiltered;
    }
  }

  // Score candidate relevance
  const scored = candidates.map((m) => {
    let score = 0;
    m.tags.forEach((tag) => {
      if (msgLower.includes(tag)) score += 5;
      if (fullConversationText.includes(tag)) score += 3;
    });

    if (targetGenreKeyword && (m.tags.includes(targetGenreKeyword) || m.genre.toLowerCase().includes(targetGenreKeyword))) {
      score += 20;
    }

    return { movie: m, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let selected = scored.slice(0, 5).map((s) => s.movie);

  if (selected.length === 0) {
    selected = FALLBACK_DATABASE.filter((m) => !prevSet.has(m.title.toLowerCase())).slice(0, 5);
    if (selected.length === 0) {
      selected = FALLBACK_DATABASE.slice(0, 5);
    }
  }

  let replyText = '';
  const filterDesc = [
    isIndian ? 'Indian' : isKorean ? 'Korean' : isHollywood ? 'Hollywood' : '',
    targetGenreKeyword ? targetGenreKeyword.toUpperCase() : 'selected'
  ].filter(Boolean).join(' ');

  if (isUrdu) {
    if (isMoreRequest) {
      replyText = `Aap ki requested filter (${filterDesc || 'pasandida'}) ke hawale se, ye lijiye aur behtareen movies:`;
    } else if (msgLower.includes('summary') || msgLower.includes('kya hai') || msgLower.includes('kesi hai')) {
      replyText = `Aap ke sawal ke jawab mein, ye dekhein is film ki summary aur details:`;
    } else {
      replyText = `Aap ki request (${filterDesc}) ke hisab se, ye top recommendations aap ko zaroor pasand aayeingay:`;
    }
  } else {
    if (isMoreRequest) {
      replyText = `Continuing with your ${filterDesc || 'selected'} preference, here are more recommended titles matching your criteria:`;
    } else if (msgLower.includes('summary') || msgLower.includes('what is') || msgLower.includes('how is')) {
      replyText = `Here is the cinematic summary and details for your query:`;
    } else {
      replyText = `Based on your requested criteria (${filterDesc}), here are top recommendations curated specifically for you:`;
    }
  }

  const movieCards = selected.map((m) => ({
    title: m.title,
    year: m.year,
    genre: m.genre,
    rating: m.rating,
    summary: isUrdu ? m.summaryUr : m.summaryEn,
    matchReason: isUrdu ? m.reasonUr : m.reasonEn,
  }));

  return { replyText, movieCards };
}

// AI Chat Assistant API
app.post('/api/ai/chat', async (req, res) => {
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

      const prompt = `You are MoodFlix AI, an elite film & drama expert, movie critic, and friendly chat companion.

CURRENT USER MESSAGE: "${message}"
LANGUAGE SETTING: ${isUrdu ? 'Roman Urdu (Urdu written purely in Latin/English alphabet)' : 'English'}.

CONVERSATION HISTORY:
${historySummary}

PREVIOUSLY RECOMMENDED OR WATCHED TITLES IN THIS SESSION:
${prevRecList}

CRITICAL RULES FOR CHAT BEHAVIOR:

1. ALWAYS ANSWER THE USER'S LATEST MESSAGE FIRST:
   - Understand and answer the user's latest message directly before doing anything else.
   - If the user asks a question about a movie (e.g. "Is this movie horror?", "Tell me about Tumbbad", "Is it scary?"), ANSWER THE QUESTION DIRECTLY in replyText.
   - When answering a question or explaining a movie, SET movieCards TO AN EMPTY ARRAY []! Do NOT output movie cards when the user is asking a question or chatting.

2. WHEN TO RECOMMEND MOVIES:
   - ONLY output movie recommendations in movieCards when the user explicitly asks for recommendations, suggestions, lists, or "more" movies (e.g. "Recommend movies", "Suggest horror movies", "More movies", "Give me more").

3. WATCHED LIST / DIFFERENT SELECTIONS:
   - If the user says "I have watched this", "I watched those already", or "I have already seen these", recommend DIFFERENT, NEW movies from the SAME genre/industry active in context. Do not repeat any title from PREVIOUSLY RECOMMENDED OR WATCHED TITLES.

4. MAINTAIN THE CURRENT GENRE:
   - Maintain the active genre (e.g. Horror -> More Horror recommendations, Indian Thriller -> More Indian Thriller recommendations) unless the user explicitly requests to change genres.

5. NEVER USE BOILERPLATE INTROS:
   - NEVER reply with "I am your movie expert companion..." or capability descriptions unless the user explicitly asks "Who are you?" or "What can you do?".
   - DO NOT switch into introduction mode or capability explanation mode during an ongoing conversation!

6. CONVERSATION CONTEXT & MEMORY:
   - Remember the currently discussed movie, topic, and user preferences from the CONVERSATION HISTORY.

7. SCRIPT & LANGUAGE FORMATTING:
   - If language is 'ur' or user writes in Roman Urdu:
     * NEVER USE ARABIC/URDU SCRIPT (no Urdu script characters).
     * WRITE EVERYTHING IN PURE ROMAN URDU (Latin alphabet).
     * Example: "Nahi, Badla horror movie nahi hai. Badla ek zabardast Indian crime mystery thriller hai."
   - If language is 'en': Write in natural, engaging English.

OUTPUT FORMAT:
Return strict JSON with:
- replyText: Direct, accurate, conversational answer addressing the user's latest message first.
- movieCards: Array of movie objects (0 to 6 items). MUST be [] if the user asked a question or did not explicitly ask for movie recommendations.`;

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
                    title: { type: Type.STRING },
                    year: { type: Type.STRING },
                    genre: { type: Type.STRING },
                    rating: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                    matchReason: { type: Type.STRING },
                  },
                  required: ['title', 'genre', 'summary', 'matchReason'],
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
        return res.json(result);
      }
    }
  } catch (error: any) {
    // Gracefully use smart fallback engine when rate limit or network issue occurs
  }

  const fallbackResult = getSmartChatFallback(message, language, history, previouslyRecommended);
  return res.json(fallbackResult);
});

// AI Mood Match API
app.post('/api/ai/match', async (req, res) => {
  const { mood = '', language = 'en' } = req.body || {};

  try {
    if (!mood || typeof mood !== 'string') {
      return res.status(400).json({ error: 'Mood query is required' });
    }

    if (!apiKey) {
      return res.json({
        aiSummaryEn: `Here are recommendations for your mood: "${mood}"`,
        aiSummaryUrdu: `Aap ke mood "${mood}" ke hisab se ye top recommendations hain:`,
        recommendedMovies: [
          {
            title: 'Inception',
            matchScore: 98,
            matchReasonEn: 'Mind-bending psychological masterpiece matching your complex state of mind.',
            matchReasonUrdu: 'Agar aap mind-bending aur zahn ko ghumane wali suspense movies pasand karte hain to ye movie perfect hai.',
            moodTags: ['Mind-Bending', 'Intense', 'Sci-Fi'],
          },
          {
            title: 'Parasite',
            matchScore: 95,
            matchReasonEn: 'Dark social thriller filled with surprising turns and sharp tension.',
            matchReasonUrdu: 'Agar aap suspense aur ajeeb o ghareeb twists pasand karte hain to Parasite zaroor dekhein.',
            moodTags: ['Korean', 'Thriller', 'Dark Comedy'],
          },
          {
            title: 'The Others',
            matchScore: 93,
            matchReasonEn: 'Atmospheric psychological horror that builds incredible eerie suspense.',
            matchReasonUrdu: 'Agar aap suspense aur psychological horror pasand karte hain to ye movie aap ke mood ke liye perfect match hai.',
            moodTags: ['Horror', 'Atmospheric', 'Eerie'],
          },
          {
            title: 'The Dark Knight',
            matchScore: 96,
            matchReasonEn: 'High octane dark action driven by unforgettable drama.',
            matchReasonUrdu: 'Agar aap dark, gritty action aur Joker ki zordar acting pasand karte hain to ye movie zabardast hai.',
            moodTags: ['Action', 'Gritty', 'Dark'],
          },
        ],
      });
    }

    const prompt = `You are MoodFlix AI, an elite movie recommendation engine.
The user describes their mood: "${mood}".
Active user language context: ${language === 'ur' ? 'Roman Urdu (Urdu written in Latin script)' : 'English'}.

CRITICAL EXTRACTION & VALIDATION MANDATE:
1. Extract and validate Genre, Country/Industry, Language, and Mood from the user's mood query.
2. The AI MUST ONLY recommend movies/dramas that match ALL requested filters.
   - Example: If the user requests "Indian thriller movies", ONLY recommend Indian thriller movies like Drishyam, Andhadhun, Ratsasan, Kahaani, Ugly, A Wednesday, Special 26, Badla.
   - Do NOT recommend Romance movies when Thriller is requested.
   - Do NOT recommend Hollywood movies when Indian movies are requested unless explicitly asked!
3. Recommend 4 to 6 real, highly acclaimed movies/dramas that genuinely fit all extracted filters.
4. Provide explanations in BOTH English and Roman Urdu for every movie.
5. For Roman Urdu (matchReasonUrdu and aiSummaryUrdu):
   - DO NOT USE URDU SCRIPT (no Arabic/Urdu lettering).
   - Write purely in Roman Urdu using English alphabet (e.g. "Drishyam, Andhadhun aur Ratsasan behad zabardast Indian thriller movies hain.").
6. Return strict JSON following the schema.`;

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
                  title: { type: Type.STRING },
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

    return res.json(result);
  } catch (error: any) {
    return res.json({
      aiSummaryEn: `Here are top recommendations tailored for your mood: "${mood}"`,
      aiSummaryUrdu: `Aap ke mood "${mood}" ke hisab se ye top recommendations hain:`,
      recommendedMovies: [
        {
          title: 'Inception',
          matchScore: 98,
          matchReasonEn: 'Mind-bending psychological masterpiece matching your complex state of mind.',
          matchReasonUrdu: 'Agar aap mind-bending aur zahn ko ghumane wali suspense movies pasand karte hain to ye movie perfect hai.',
          moodTags: ['Mind-Bending', 'Intense', 'Sci-Fi'],
        },
        {
          title: 'Parasite',
          matchScore: 95,
          matchReasonEn: 'Dark social thriller filled with surprising turns and sharp tension.',
          matchReasonUrdu: 'Agar aap suspense aur ajeeb o ghareeb twists pasand karte hain to Parasite zaroor dekhein.',
          moodTags: ['Korean', 'Thriller', 'Dark Comedy'],
        },
        {
          title: 'The Others',
          matchScore: 93,
          matchReasonEn: 'Atmospheric psychological horror that builds incredible eerie suspense.',
          matchReasonUrdu: 'Agar aap suspense aur psychological horror pasand karte hain to ye movie aap ke mood ke liye perfect match hai.',
          moodTags: ['Horror', 'Atmospheric', 'Eerie'],
        },
        {
          title: 'The Dark Knight',
          matchScore: 96,
          matchReasonEn: 'High octane dark action driven by unforgettable drama.',
          matchReasonUrdu: 'Agar aap dark, gritty action aur Joker ki zordar acting pasand karte hain to ye movie zabardast hai.',
          moodTags: ['Action', 'Gritty', 'Dark'],
        },
      ],
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MoodFlix AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
