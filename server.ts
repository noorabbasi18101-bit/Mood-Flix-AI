import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import healthHandler from './api/health.js';
import tmdbHandler from './api/tmdb.js';
import chatHandler from './api/ai/chat.js';
import matchHandler from './api/ai/match.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Attach Vercel Serverless Function Handlers directly to Express routes
app.get('/api/health', (req, res) => healthHandler(req, res));
app.all('/api/tmdb', (req, res) => tmdbHandler(req, res));
app.all('/api/ai/chat', (req, res) => chatHandler(req, res));
app.all('/api/ai/match', (req, res) => matchHandler(req, res));

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
