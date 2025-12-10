import { ChordToken } from '../types';

const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const NOTE_TO_INDEX: Record<string, number> = {
  C:0, 'C#':1, Db:1, D:2, 'D#':3, Eb:3, E:4, F:5, 'F#':6, Gb:6, G:7, 'G#':8, Ab:8, A:9, 'A#':10, Bb:10, B:11
};

export interface TransposeOptions {
  semitones: number;
  preferFlats?: boolean;
}

export function transposeNote(note: string, semitones: number, preferFlats = false): string {
  const idx = NOTE_TO_INDEX[note];
  if (idx === undefined) return note;
  const next = (idx + semitones + 12) % 12;
  return preferFlats ? FLATS[next] : SHARPS[next];
}

export function transposeChordName(name: string, semitones: number, preferFlats = false): string {
  // Parse basic chord name: Root + Quality + optional /Bass
  const slashIdx = name.indexOf('/');
  const main = slashIdx >= 0 ? name.slice(0, slashIdx) : name;
  const bass = slashIdx >= 0 ? name.slice(slashIdx + 1) : undefined;
  const match = /^([A-G](?:#|b)?)(.*)$/.exec(main);
  if (!match) return name;
  const [, root, rest] = match;
  const newRoot = transposeNote(root, semitones, preferFlats);
  const newBass = bass ? transposeNote(bass, semitones, preferFlats) : undefined;
  return newBass ? `${newRoot}${rest}/${newBass}` : `${newRoot}${rest}`;
}

export function applyCapo(name: string, capo: number, preferFlats = false): string {
  // Adjust display names to reflect shapes for capo
  // Displayed chord shape is transposed DOWN by capo relative to sounding pitch.
  // E.g., sounding G with capo 2 uses F shape (down 2 semitones).
  if (capo <= 0) return name;
  return transposeChordName(name, -capo, preferFlats);
}

export function transposeToken(token: ChordToken, opts: TransposeOptions): ChordToken {
  const display = transposeChordName(token.display ?? token.raw.replace(/[\[\]]/g, ''), opts.semitones, !!opts.preferFlats);
  return { ...token, display };
}

export function preferredAccidentalForKey(key: string): 'flats' | 'sharps' {
  // Simple heuristic based on common key spellings
  const flatKeys = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fm', 'Bbm', 'Ebm', 'Abm', 'Dbm', 'Gbm', 'Cbm']);
  return flatKeys.has(key) ? 'flats' : 'sharps';
}


