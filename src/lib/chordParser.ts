import { ChordToken, LyricToken, ParsedLine } from '../types';

const CHORD_INLINE_REGEX = /\[([A-G](?:#|b)?(?:m|maj7|maj|m7|7|9|11|13|sus2|sus4|add9)?(?:\/[A-G](?:#|b)?)?)\]/g;

export function parseInline(line: string): ParsedLine {
  if (!line.trim()) return { kind: 'blank' };
  if (/^#/.test(line)) return { kind: 'comment', text: line.slice(1).trim() };
  if (/^\(x(\d+)?\)$/.test(line.trim())) {
    const m = /^\(x(\d+)?\)$/.exec(line.trim());
    return { kind: 'repeat', count: m?.[1] ? Number(m[1]) : undefined };
  }
  const tokens: (ChordToken | LyricToken)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CHORD_INLINE_REGEX.lastIndex = 0;
  while ((match = CHORD_INLINE_REGEX.exec(line)) !== null) {
    const [raw, chord] = match;
    if (match.index > lastIndex) {
      tokens.push({ type: 'lyric', text: line.slice(lastIndex, match.index) });
    }
    const token = parseChordToken(chord, raw);
    tokens.push(token);
    lastIndex = match.index + raw.length;
  }
  if (lastIndex < line.length) {
    tokens.push({ type: 'lyric', text: line.slice(lastIndex) });
  }
  return { kind: 'inline', tokens };
}

export function parseChordToken(text: string, rawWithBrackets?: string): ChordToken {
  // e.g. F#m7/C# -> root F#, quality m7, bass C#
  const slashIdx = text.indexOf('/');
  const main = slashIdx >= 0 ? text.slice(0, slashIdx) : text;
  const bass = slashIdx >= 0 ? text.slice(slashIdx + 1) : undefined;
  const m = /^([A-G](?:#|b)?)(.*)$/.exec(main);
  const root = m ? m[1] : text;
  const quality = m ? m[2] : '';
  return {
    type: 'chord',
    raw: rawWithBrackets ?? `[${text}]`,
    root,
    quality,
    bass
  };
}

export function parseTextToAst(text: string): ParsedLine[] {
  const lines = text.split(/\r?\n/);
  return lines.map(parseInline);
}


