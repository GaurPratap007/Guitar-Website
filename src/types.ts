export type ChordModifier =
  | 'm' | 'maj' | 'maj7' | 'm7' | '7' | '9' | 'add9' | '11' | '13' | 'sus2' | 'sus4';

export interface ChordToken {
  type: 'chord';
  raw: string; // original text e.g. [F#m7/C#]
  root: string; // normalized root e.g. F#
  quality: string; // e.g. m7, maj7, 7, add9, sus4, etc
  bass?: string; // e.g. C#
  display?: string; // rendered name after transpose/capo
}

export interface LyricToken {
  type: 'lyric';
  text: string;
}

export type LineToken = ChordToken | LyricToken;

export type ParsedLine =
  | { kind: 'inline'; tokens: LineToken[] }
  | { kind: 'chordline'; chords: ChordToken[] }
  | { kind: 'comment'; text: string }
  | { kind: 'blank' }
  | { kind: 'repeat'; count?: number };

export interface SongFrontmatter {
  id: string;
  title: string;
  artist: string;
  album?: string;
  key: string;
  capo: number;
  youtube_id?: string;
  chord_shapes?: Record<string, ChordShape>;
  scroll_map?: Array<{ timeSec: number; lineIndex: number }>;
  tags?: string[];
}

export interface SongContent {
  frontmatter: SongFrontmatter;
  ast: ParsedLine[];
  uniqueChords: string[];
}

export interface ChordShape {
  fretting: (number | 'x')[];
  fingering?: (string | '')[];
  baseFret?: number;
  strings?: number;
  label?: string;
}

export interface SearchIndexEntry {
  id: string;
  title: string;
  artist: string;
  key: string;
  capo: number;
  tags?: string[];
}


