import Fuse from 'fuse.js';
import { SearchIndexEntry, SongContent, SongFrontmatter, ParsedLine } from '../types';

const CONTENT_URL = `${import.meta.env.BASE_URL ?? '/'}content-index.json`;

export async function fetchIndex(): Promise<{
  entries: SearchIndexEntry[];
  songs: Record<string, SongContent>;
}> {
  const res = await fetch(CONTENT_URL);
  const base = await res.json() as { entries: SearchIndexEntry[]; songs: Record<string, SongContent> };
  const local = getLocalIndex();
  return mergeIndexes(base, local);
}

export function makeSearch(entries: SearchIndexEntry[]): Fuse<SearchIndexEntry> {
  return new Fuse(entries, {
    includeScore: true,
    threshold: 0.35,
    keys: ['title', 'artist', 'tags', 'key']
  });
}

export function filterEntries(entries: SearchIndexEntry[], filters: {
  artist?: string;
  key?: string;
  capo?: number;
  tags?: string[];
}): SearchIndexEntry[] {
  return entries.filter(e => {
    if (filters.artist && e.artist !== filters.artist) return false;
    if (filters.key && e.key !== filters.key) return false;
    if (typeof filters.capo === 'number' && e.capo !== filters.capo) return false;
    if (filters.tags && filters.tags.length > 0) {
      return filters.tags.every(t => e.tags?.includes(t));
    }
    return true;
  });
}

export function collectFacets(entries: SearchIndexEntry[]): {
  artists: string[];
  keys: string[];
  capos: number[];
  tags: string[];
} {
  const artists = Array.from(new Set(entries.map(e => e.artist))).sort();
  const keys = Array.from(new Set(entries.map(e => e.key))).sort();
  const capos = Array.from(new Set(entries.map(e => e.capo))).sort((a, b) => a - b);
  const tags = Array.from(new Set(entries.flatMap(e => e.tags ?? []))).sort();
  return { artists, keys, capos, tags };
}

/**
 * Utility: collect unique chord names (without brackets) from AST
 */
export function collectUniqueChordsFromAst(ast: ParsedLine[]): string[] {
  const set = new Set<string>();
  for (const line of ast) {
    if (line.kind === 'inline') {
      for (const t of line.tokens) {
        if (t.type === 'chord') {
          set.add(t.raw.replace(/[\[\]]/g, ''));
        }
      }
    } else if (line.kind === 'chordline') {
      for (const c of line.chords) {
        set.add(c.raw.replace(/[\[\]]/g, ''));
      }
    }
  }
  return Array.from(set).sort();
}

/**
 * Local storage-based authoring support
 */
const LS_KEY = 'local_content_index';

export function getLocalIndex(): { entries: SearchIndexEntry[]; songs: Record<string, SongContent> } {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return { entries: [], songs: {} };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { entries: [], songs: {} };
    return {
      entries: Array.isArray(parsed.entries) ? parsed.entries : [],
      songs: parsed.songs && typeof parsed.songs === 'object' ? parsed.songs : {}
    };
  } catch {
    return { entries: [], songs: {} };
  }
}

export function saveLocalIndex(idx: { entries: SearchIndexEntry[]; songs: Record<string, SongContent> }): void {
  localStorage.setItem(LS_KEY, JSON.stringify(idx));
}

export function saveLocalSong(song: SongContent): { entries: SearchIndexEntry[]; songs: Record<string, SongContent> } {
  const current = getLocalIndex();
  const fm = song.frontmatter;
  const entry: SearchIndexEntry = {
    id: fm.id,
    title: fm.title,
    artist: fm.artist,
    key: fm.key,
    capo: fm.capo,
    tags: fm.tags
  };
  const entriesMap = new Map<string, SearchIndexEntry>();
  [...current.entries, entry].forEach(e => entriesMap.set(e.id, e));
  const mergedEntries = Array.from(entriesMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  const mergedSongs = { ...current.songs, [fm.id]: song };
  const next = { entries: mergedEntries, songs: mergedSongs };
  saveLocalIndex(next);
  return next;
}

export function mergeIndexes(
  base: { entries: SearchIndexEntry[]; songs: Record<string, SongContent> },
  local: { entries: SearchIndexEntry[]; songs: Record<string, SongContent> }
): { entries: SearchIndexEntry[]; songs: Record<string, SongContent> } {
  const songIds = new Set<string>([
    ...Object.keys(base.songs),
    ...Object.keys(local.songs)
  ]);
  const songs: Record<string, SongContent> = {};
  for (const id of songIds) {
    songs[id] = local.songs[id] ?? base.songs[id];
  }
  const byId = new Map<string, SearchIndexEntry>();
  [...base.entries, ...local.entries].forEach(e => byId.set(e.id, e));
  const entries = Array.from(byId.values()).sort((a, b) => a.title.localeCompare(b.title));
  return { entries, songs };
}


