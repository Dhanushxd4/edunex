import { Router, Request, Response } from 'express';
import https from 'https';

const router = Router();
const YT_API = 'https://www.googleapis.com/youtube/v3';

function fetchJSON(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
    }).on('error', reject);
  });
}

// GET /api/youtube/search?q=javascript&maxResults=10
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, maxResults = '10' } = req.query;
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(503).json({ error: 'YouTube API not configured' });

    const url = `${YT_API}/search?part=snippet&type=video&q=${encodeURIComponent(q as string)}&maxResults=${maxResults}&key=${key}`;
    const data = await fetchJSON(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'YouTube search failed' });
  }
});

// GET /api/youtube/video/:id
router.get('/video/:id', async (req: Request, res: Response) => {
  try {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) return res.status(503).json({ error: 'YouTube API not configured' });

    const url = `${YT_API}/videos?part=snippet,contentDetails,statistics&id=${req.params.id}&key=${key}`;
    const data = await fetchJSON(url);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

export default router;
