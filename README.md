## Chord Tabs — React + Vite + TypeScript + Tailwind

Lightweight, accessible, mobile-first chord/tabs site. Features:
- Autoscroll with speed, keyboard controls, margin target, and reduced-motion respect
- YouTube tutorial embed and optional scroll sync via `scroll_map`
- Transpose and capo support (sharps/flats, slash chords, common extensions)
- Interactive chord hover tooltips and right-column diagram panel
- Client-side PDF export and copy-as-markdown
- Prebuilt JSON content index, Fuse.js search, filters for artist/key/tags
- Lazy-loaded YouTube and chord diagrams for performance

### Quick start
```bash
npm install
npm run content:build   # builds public/content-index.json from content/songs/*.md
npm run dev
```
Open the local URL from Vite. Six placeholder songs are included.

### Build
```bash
npm run build
npm run preview
```

### Tests
```bash
npm test
```

### Keyboard shortcuts
- Space: Play/Pause autoscroll
- Arrow Up/Down or +/-: Adjust autoscroll speed

### Adding content
Create a markdown file in `content/songs/`:
```yaml
---
id: perfect
title: "Perfect (placeholder)"
artist: "Artist Name"
key: "G"
capo: 0
youtube_id: "XXXXXXXXX"
tags: ["pop","ballad"]
chord_shapes:
  G: { fretting: [3,2,0,0,0,3], fingering: ["3","2","","","","3"], baseFret: 1 }
scroll_map:
  - { timeSec: 0, lineIndex: 0 }
  - { timeSec: 12, lineIndex: 4 }
---
[G]Lyrics [Em]here
```
Run `npm run content:build` to regenerate `public/content-index.json`.

### Video sync maps
If you include `youtube_id` and `scroll_map`, the song page can follow the video. The map is a simple array of `{ timeSec, lineIndex }`. To generate it, play the tutorial, note timestamps where lyric lines begin, and record the corresponding `lineIndex` of that line in the parsed content (0-based). For complex songs, provide more dense points.

### Deployment (GitHub Pages)
Two options:
1) npm script (gh-pages):
```bash
export BASE="/<your-repo-name>/"
npm run build
npm run deploy
```
Then enable GitHub Pages on the `gh-pages` branch.

2) GitHub Actions: see `.github/workflows/deploy.yml`. Push to `main`; it builds and publishes to `gh-pages`.

Note: For GitHub Pages, set `BASE="/<repo-name>/"` before build so routes work.

### Legal
This repo ships with placeholder chord/lyric snippets only. If you add copyrighted content, ensure you have rights and comply with DMCA.


