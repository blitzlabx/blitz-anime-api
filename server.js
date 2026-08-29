import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  HttpClient,
  AllmangaProvider,
  GogoanimeProvider,
  AnimeParadiseProvider,
  AnikotoProvider,
  MegaPlayProvider,
  GoyabuProvider,
  MangadexProvider,
  WeebcentralProvider,
  MangapillProvider,
  AnilistMeta,
  MalMeta,
  KitsuMeta,
  MappingClient,
  downloadVideo,
  downloadMangaChapter,
} from 'anime-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const BLITZ_SIGNATURE = 'Built with ⚡ by Blitz (blitzlabx)';
const TMP_DIR = path.join(__dirname, 'tmp');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const app = express();
app.use(cors({ origin: '*', methods: ['GET', 'OPTIONS'], allowedHeaders: ['*'] }));
app.use(express.json());
app.use(express.static('public'));

const http = new HttpClient({ timeoutMs: 30000 });
const mapping = new MappingClient(http);

const providers = {
  allmanga: new AllmangaProvider(http),
  gogoanime: new GogoanimeProvider(http),
  animeparadise: new AnimeParadiseProvider(http),
  anikoto: new AnikotoProvider(http),
  megaplay: new MegaPlayProvider(http),
  goyabu: new GoyabuProvider(http),
  mangadex: new MangadexProvider(http),
  weebcentral: new WeebcentralProvider(http),
  mangapill: new MangapillProvider(http),
};

const metaProviders = {
  anilist: new AnilistMeta(http, { mappingClient: mapping }),
  mal: new MalMeta(http, { mappingClient: mapping }),
  kitsu: new KitsuMeta(http, { mappingClient: mapping }),
};

const animeProviders = ['allmanga', 'gogoanime', 'animeparadise', 'anikoto', 'megaplay', 'goyabu'];
const mangaProviders = ['mangadex', 'weebcentral', 'mangapill'];

const blitzResolveProvider = (id) => providers[id?.toLowerCase()] || null;
const blitzResolveMeta = (id) => metaProviders[id?.toLowerCase()] || metaProviders.anilist;

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Blitz Anime & Manga API',
    author: 'Blitz (blitzlabx)',
    version: '2.5.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    animeProviders,
    mangaProviders,
    meta: Object.keys(metaProviders),
    features: ['search', 'content', 'stream', 'meta', 'download-video', 'download-manga'],
    signature: BLITZ_SIGNATURE,
  });
});

app.get('/ping', (req, res) => {
  res.status(200).send('pong ⚡ Blitz');
});

app.get('/', (req, res) => res.redirect('/docs'));

app.get('/api/v1/providers', (req, res) => {
  res.json({
    anime: animeProviders,
    manga: mangaProviders,
    metadata: Object.keys(metaProviders),
    author: 'Blitz (blitzlabx)',
    note: 'Free public API for building anime/manga applications',
  });
});

app.get('/api/v1/search', async (req, res) => {
  try {
    const { q, provider = 'allmanga' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing query parameter: q', by: 'Blitz' });
    const p = blitzResolveProvider(provider);
    if (!p) return res.status(400).json({ error: 'Unknown provider', available: Object.keys(providers) });
    const results = await p.search(String(q));
    res.json({ results, provider, type: mangaProviders.includes(provider) ? 'manga' : 'anime', by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/manga/search', async (req, res) => {
  try {
    const { q, provider = 'mangadex' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing q', by: 'Blitz' });
    const p = blitzResolveProvider(provider);
    if (!p || !mangaProviders.includes(provider)) {
      return res.status(400).json({ error: 'Unknown manga provider', available: mangaProviders });
    }
    const results = await p.search(String(q));
    res.json({ results, provider, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/content', async (req, res) => {
  try {
    const { id, provider } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const p = blitzResolveProvider(provider) || blitzResolveProvider(String(id).split(':')[0]);
    if (!p) return res.status(400).json({ error: 'Could not resolve provider from id' });
    const units = await p.fetchContentUnits(String(id));
    res.json({ units, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/stream', async (req, res) => {
  try {
    const { id, language = 'sub', provider } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const p = blitzResolveProvider(provider) || blitzResolveProvider(String(id).split(':')[0]);
    if (!p) return res.status(400).json({ error: 'Could not resolve provider' });
    const stream = await p.resolveStream(String(id), language);
    res.json({ stream, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/meta/search', async (req, res) => {
  try {
    const { q, meta = 'anilist' } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing q', by: 'Blitz' });
    const m = blitzResolveMeta(meta);
    const results = await m.search(String(q));
    res.json({ results, meta, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/meta/info', async (req, res) => {
  try {
    const { id, meta = 'anilist' } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const m = blitzResolveMeta(meta);
    const info = await m.fetchMediaInfo(String(id));
    res.json({ info, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/meta/browse', async (req, res) => {
  try {
    const { type = 'trending', meta = 'anilist', catalogType = 'ANIME', season, year, perPage = 20 } = req.query;
    const m = blitzResolveMeta(meta);
    const options = { catalogType, perPage: Number(perPage) };
    if (season) options.season = season;
    if (year) options.year = Number(year);
    const results = await m.browse(type, options);
    res.json({ results, type, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/meta/stream', async (req, res) => {
  try {
    const { id, episode = 1, provider = 'allmanga', language = 'sub', meta = 'anilist' } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const m = blitzResolveMeta(meta);
    const p = blitzResolveProvider(provider);
    if (!p) return res.status(400).json({ error: 'Unknown content provider' });
    const stream = await m.resolveStream(String(id), Number(episode), p, language);
    res.json({ stream, by: 'Blitz (blitzlabx)' });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/download/video', async (req, res) => {
  try {
    const { id, language = 'sub', provider } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const p = blitzResolveProvider(provider) || blitzResolveProvider(String(id).split(':')[0]);
    if (!p) return res.status(400).json({ error: 'Could not resolve provider' });
    const resolved = await p.resolveStream(String(id), language);
    if (resolved.type !== 'video' || !resolved.streams?.length) {
      return res.status(404).json({ error: 'No video streams found', by: 'Blitz' });
    }
    const outName = `blitz_${Date.now()}.mp4`;
    const outPath = path.join(TMP_DIR, outName);
    const result = await downloadVideo(resolved.streams, outPath, {
      onProgress: () => {},
    });
    res.download(result.outputPath || outPath, outName, (err) => {
      fs.unlink(outPath, () => {});
      if (err && !res.headersSent) res.status(500).json({ error: err.message, by: 'Blitz' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.get('/api/v1/download/manga', async (req, res) => {
  try {
    const { id, provider } = req.query;
    if (!id) return res.status(400).json({ error: 'Missing id', by: 'Blitz' });
    const p = blitzResolveProvider(provider) || blitzResolveProvider(String(id).split(':')[0]);
    if (!p) return res.status(400).json({ error: 'Could not resolve provider' });
    const resolved = await p.resolveStream(String(id));
    if (resolved.type !== 'manga' || !resolved.pages) {
      return res.status(404).json({ error: 'No manga pages found', by: 'Blitz' });
    }
    const outName = `blitz_manga_${Date.now()}.zip`;
    const outPath = path.join(TMP_DIR, outName);
    const result = await downloadMangaChapter(resolved.pages, outPath, {
      onProgress: () => {},
    });
    res.download(result.outputPath || outPath, outName, (err) => {
      fs.unlink(outPath, () => {});
      if (err && !res.headersSent) res.status(500).json({ error: err.message, by: 'Blitz' });
    });
  } catch (err) {
    res.status(500).json({ error: err.message, by: 'Blitz' });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    available: [
      'GET /health',
      'GET /ping',
      'GET /api/v1/providers',
      'GET /api/v1/search?q=&provider=',
      'GET /api/v1/manga/search?q=&provider=',
      'GET /api/v1/content?id=',
      'GET /api/v1/stream?id=&language=',
      'GET /api/v1/meta/search?q=',
      'GET /api/v1/meta/info?id=',
      'GET /api/v1/meta/browse?type=',
      'GET /api/v1/meta/stream?id=&episode=&provider=',
      'GET /api/v1/download/video?id=&language=',
      'GET /api/v1/download/manga?id=',
    ],
    docs: '/docs',
    author: 'Blitz (blitzlabx)',
  });
});

app.listen(PORT, () => {
  console.log(`⚡ Blitz Anime & Manga API online → http://localhost:${PORT}`);
  console.log(`   Health: /health | Docs: /docs | Downloads ready`);
  console.log(`   ${BLITZ_SIGNATURE}`);
});
