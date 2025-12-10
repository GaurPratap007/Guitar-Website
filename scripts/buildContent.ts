import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { parseTextToAst } from '../src/lib/chordParser';
import type { ParsedLine, SearchIndexEntry, SongContent, SongFrontmatter } from '../src/types';
import chordDb from '../src/data/chords.json';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content', 'songs');
const PUBLIC_OUT = path.join(ROOT, 'public', 'content-index.json');
const DIST_OUT = path.join(ROOT, 'dist', 'content-index.json');

function uniqueChords(ast: ParsedLine[]): string[] {
  const set = new Set<string>();
  for (const line of ast) {
    if (line.kind === 'inline') {
      for (const t of line.tokens) {
        if (t.type === 'chord') {
          set.add(t.raw.replace(/[\[\]]/g, ''));
        }
      }
    } else if (line.kind === 'chordline') {
      for (const c of line.chords) set.add(c.raw.replace(/[\[\]]/g, ''));
    }
  }
  return Array.from(set).sort();
}

function readSongs(): Record<string, SongContent> {
  const files = fs.existsSync(CONTENT_DIR) ? fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md')) : [];
  const result: Record<string, SongContent> = {};
  for (const file of files) {
    const full = path.join(CONTENT_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data, content } = matter(raw);
    const fm = data as SongFrontmatter;
    if (!fm.id) {
      fm.id = path.basename(file, '.md');
    }
    const ast = parseTextToAst(content);
    const chords = uniqueChords(ast);
    result[fm.id] = {
      frontmatter: fm,
      ast,
      uniqueChords: chords
    };
  }
  return result;
}

function buildIndex() {
  const songs = readSongs();
  const entries: SearchIndexEntry[] = Object.values(songs).map(s => ({
    id: s.frontmatter.id,
    title: s.frontmatter.title,
    artist: s.frontmatter.artist,
    key: s.frontmatter.key,
    capo: s.frontmatter.capo,
    tags: s.frontmatter.tags
  }));
  const payload = { entries, songs };
  fs.mkdirSync(path.dirname(PUBLIC_OUT), { recursive: true });
  fs.writeFileSync(PUBLIC_OUT, JSON.stringify(payload, null, 2), 'utf8');
  // Also echo to dist for convenience
  fs.mkdirSync(path.dirname(DIST_OUT), { recursive: true });
  fs.writeFileSync(DIST_OUT, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Wrote ${entries.length} entries to public/content-index.json`);
}

buildIndex();


