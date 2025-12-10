## Contributing

### Add a song
1. Create a new file under `content/songs/your-song-id.md`.
2. Include required frontmatter:
```yaml
---
id: your-id
title: "Song Title"
artist: "Artist Name"
key: "G"
capo: 0
youtube_id: "XXXXXXXXX" # optional
tags: ["tag1","tag2"]
chord_shapes:
  # optional overrides per song
  G: { fretting: [3,2,0,0,0,3], fingering: ["3","2","","","","3"], baseFret: 1 }
scroll_map:
  # optional array of {timeSec, lineIndex}
  - { timeSec: 0, lineIndex: 0 }
---
[G]Your [Em]lyrics [C]with [D]chords
```
3. Run `npm run content:build` locally to update `public/content-index.json`.
4. Open a Pull Request.

### Create a video sync map
- Play the tutorial video and note timestamps where each line begins.
- Find the `lineIndex` of that line in the page (or count lines, 0-based).
- Add entries like `{ timeSec: 12.5, lineIndex: 7 }` to `scroll_map`.

### Chord shapes
Chord diagrams are sourced from `src/data/chords.json`. You can override per song via `chord_shapes` in frontmatter. A shape looks like:
```yaml
G: { fretting: [3,2,0,0,0,3], fingering: ["3","2","","","","3"], baseFret: 1 }
```
Where `fretting` is low-E to high-E. Use `x` for muted strings and `0` for open.

### Code of Conduct
See `CODE_OF_CONDUCT.md`.


