const DEFAULT_TMDB_KEY = '8e2b834458f29e46a7be7c082ed64b85';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const endpoint = req.query.endpoint as string;
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    const tmdbKey = process.env.VITE_TMDB_API_KEY || process.env.TMDB_API_KEY || DEFAULT_TMDB_KEY;
    
    const queryParams = new URLSearchParams();
    queryParams.set('api_key', tmdbKey);

    if (req.query) {
      Object.keys(req.query).forEach((key) => {
        if (key !== 'endpoint') {
          queryParams.set(key, String(req.query[key]));
        }
      });
    }

    const targetUrl = `https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`;
    const tmdbRes = await fetch(targetUrl);

    if (!tmdbRes.ok) {
      return res.status(tmdbRes.status).json({ error: `TMDb Error ${tmdbRes.statusText}` });
    }

    const data = await tmdbRes.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDb proxy error:', error);
    return res.status(500).json({ error: 'Failed to fetch from TMDb' });
  }
}
