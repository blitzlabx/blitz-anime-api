<div align="center">

# ⚡ BLITZ ANIME & MANGA API

### Free • High-Performance • Production-Ready  
**Anime + Manga Streaming & Download API for Developers**

[![Version](https://img.shields.io/badge/version-2.5.0-00f3ff?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://github.com/blitzlabx)
[![License](https://img.shields.io/badge/license-MIT-bf00ff?style=for-the-badge)](LICENSE)
[![CORS](https://img.shields.io/badge/CORS-★_ALL_ORIGINS-ffee00?style=for-the-badge)](#)
[![Downloads](https://img.shields.io/badge/Downloads-Video_+_Manga-00f3ff?style=for-the-badge)](#)
[![Built by](https://img.shields.io/badge/Built_by-Blitz_(blitzlabx)-00f3ff?style=for-the-badge)](https://github.com/blitzlabx)

<br/>

```text
     ██████╗ ██╗     ██╗████████╗███████╗
     ██╔══██╗██║     ██║╚══██╔══╝╚══███╔╝
     ██████╔╝██║     ██║   ██║     ███╔╝ 
     ██╔══██╗██║     ██║   ██║    ███╔╝  
     ██████╔╝███████╗██║   ██║   ███████╗
     ╚═════╝ ╚══════╝╚═╝   ╚═╝   ╚══════╝
         A N I M E  &  M A N G A   A P I
```

Powered by anime-sdk • Crafted by Blitz (blitzlabx)

</div>

---

🔥 What is this?

A free, open, battle-tested public API that lets any developer build full anime and manga applications in minutes.

· Search across 6 anime + 3 manga content providers
· Rich metadata from AniList, MyAnimeList (Jikan), Kitsu
· Direct stream resolution (HLS / MP4) + manga page images
· Server-side downloads: episode → MP4, chapter → ZIP
· Unified URN IDs + automatic cross-source mapping
· CORS open to the world (*)
· Lightweight /health + /ping for free-tier uptime monitors
· Ready for Render free tier, Railway, Fly, or any Node host

Built by Blitz so the community can ship faster.

---

⚡ Live Endpoints

Method Endpoint Description
GET /health Full health + uptime JSON (UptimeRobot / Render)
GET /ping Ultra-light pong ⚡ Blitz
GET /api/v1/providers List anime + manga + meta providers
GET /api/v1/search?q=&provider= Search anime or manga
GET /api/v1/manga/search?q=&provider= Manga-focused search
GET /api/v1/content?id= Episode / chapter list
GET /api/v1/stream?id=&language= Resolve playable streams or manga pages
GET /api/v1/download/video?id=&language= Download episode as MP4
GET /api/v1/download/manga?id= Download chapter as ZIP
GET /api/v1/meta/search?q= Metadata search
GET /api/v1/meta/info?id= Full media info
GET /api/v1/meta/browse?type= Trending / seasonal / top
GET /api/v1/meta/stream?id=&episode=&provider= Meta → stream in one call

Fancy interactive docs live at /docs (neon + thunder theme, mobile-perfect).

---

🚀 Deploy on Render (Free Tier)

1. Push this repository to GitHub
2. Create a new Web Service on render.com
3. Connect the repo — render.yaml is detected automatically
4. Health check path: /health
5. Deploy

```bash
# Local
npm install
npm start
# → http://localhost:3000/health
```

Docker:

```bash
docker build -t blitz-anime-api .
docker run -p 3000:3000 blitz-anime-api
```

---

🛡 Uptime Monitoring

Point any free monitor at:

```
https://your-app.onrender.com/health
```

or

```
https://your-app.onrender.com/ping
```

Recommended interval: 5–10 minutes (keeps free Render instances warm).

---

🧩 Example Usage

```js
// Anime search
const res = await fetch('https://your-url.onrender.com/api/v1/search?q=Frieren&provider=allmanga');
const { results } = await res.json();

// Episodes
const content = await fetch(`https://your-url.onrender.com/api/v1/content?id=${results[0].id}`);
const { units } = await content.json();

// Stream
const stream = await fetch(`https://your-url.onrender.com/api/v1/stream?id=${units[0].id}&language=sub`);

// Download video
// window.location = `https://your-url.onrender.com/api/v1/download/video?id=${units[0].id}`;

// Manga
const manga = await fetch('https://your-url.onrender.com/api/v1/manga/search?q=Frieren&provider=mangadex');
// Download chapter
// window.location = `https://your-url.onrender.com/api/v1/download/manga?id=...`;
```

---

🎖 Credits

Role Credit
Core SDK anime-sdk by hexxt-git
API Design, Downloads, Hardening, Free Public Instance, Neon Docs Blitz (blitzlabx)
Social @blitzlabx

Huge respect to the original anime-sdk team. This free endpoint exists because of their excellent work.

---

📜 License

MIT — free to use, fork, commercialize, and ship.

Just don't pretend you wrote the underlying SDK.

---

<div align="center">

⚡ Built with thunder by Blitz

Free anime & manga infrastructure for every developer.

blitzlabx

</div>
