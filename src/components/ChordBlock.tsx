import React, { useMemo, useRef, useState } from 'react';
import { ParsedLine, ChordToken } from '../types';
import { applyCapo, preferredAccidentalForKey, transposeChordName } from '../lib/transpose';
import chordDb from '../data/chords.json';
const LazyDiagram = React.lazy(() => import('./ChordDiagram'));

export interface ChordBlockProps {
  ast: ParsedLine[];
  displayMode: 'combined' | 'chords' | 'lyrics';
  transpose: number;
  capo: number;
  songKey: string;
}

function renderChord(
  token: ChordToken,
  transpose: number,
  capo: number,
  preferFlats: boolean,
  onHover?: (name: string, target: HTMLElement | null) => void
): JSX.Element {
  const base = token.raw.replace(/[\[\]]/g, '');
  const name = applyCapo(transposeChordName(base, transpose, preferFlats), capo, preferFlats);
  const chordShape = (chordDb as Record<string, any>)[name] || (chordDb as Record<string, any>)[base];
  return (
    <span
      key={`${base}-${name}-${Math.random()}`}
      className="inline-flex items-center px-1 rounded bg-brand-100 text-brand-700 font-medium cursor-help focus:outline-none focus:ring-2 focus:ring-brand-500"
      tabIndex={0}
      onMouseEnter={(e) => onHover?.(name, e.currentTarget)}
      onFocus={(e) => onHover?.(name, e.currentTarget)}
      onMouseLeave={() => onHover?.('', null)}
      onBlur={() => onHover?.('', null)}
      aria-label={`Chord ${name}`}
    >
      {name}
    </span>
  );
}

export default function ChordBlock({ ast, displayMode, transpose, capo, songKey }: ChordBlockProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ name: string; top: number; left: number } | null>(null);
  const preferFlats = useMemo(() => preferredAccidentalForKey(songKey) === 'flats', [songKey]);

  function handleHover(name: string, target: HTMLElement | null) {
    if (!target || !name) {
      setHover(null);
      return;
    }
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    // Estimate diagram card size (diagram width 160 + padding)
    const diagramWidth = 176;
    const diagramHeight = 200;
    const rawLeft = rect.left - containerRect.left + rect.width / 2;
    const minLeft = diagramWidth / 2 + 8;
    const maxLeft = containerRect.width - diagramWidth / 2 - 8;
    const clampedLeft = Math.max(minLeft, Math.min(maxLeft, rawLeft));
    // Prefer below; if not enough space, show above
    const spaceBelow = containerRect.bottom - rect.bottom;
    const showAbove = spaceBelow < diagramHeight + 12;
    const top = showAbove
      ? rect.top - containerRect.top - diagramHeight - 8
      : rect.bottom - containerRect.top + 8;
    setHover({ name, top, left: clampedLeft });
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="space-y-2">
        {ast.map((line, i) => {
          if (line.kind === 'blank') return <div key={i} className="h-4" data-line-index={i} />;
          if (line.kind === 'comment') return <div key={i} className="text-xs text-gray-500 italic" data-line-index={i}># {line.text}</div>;
          if (line.kind === 'repeat') return <div key={i} className="text-xs text-gray-500" data-line-index={i}>(x{line.count ?? 2})</div>;
          if (line.kind === 'inline') {
            return (
              <div key={i} className="leading-7" data-line-index={i}>
                {line.tokens.map((t, idx) => {
                  if (t.type === 'lyric') {
                    if (displayMode === 'chords') return null;
                    return <span key={idx}>{t.text}</span>;
                  }
                  if (t.type === 'chord') {
                    if (displayMode === 'lyrics') return null;
                    return renderChord(t, transpose, capo, preferFlats, handleHover);
                  }
                  return null;
                })}
              </div>
            );
          }
          if (line.kind === 'chordline') {
            return (
              <div key={i} className="flex gap-3 flex-wrap" data-line-index={i}>
                {line.chords.map(c => renderChord(c, transpose, capo, preferFlats, handleHover))}
              </div>
            );
          }
          return null;
        })}
      </div>
      {hover && (chordDb as Record<string, any>)[hover.name] && (
        <div
          className="hidden sm:block absolute z-20 pointer-events-none"
          style={{ top: hover.top, left: hover.left, transform: 'translateX(-50%)' }}
        >
          <div className="bg-white border rounded-lg shadow-lg p-2">
            <React.Suspense fallback={<div className="p-2 text-xs text-gray-500">Loading diagram…</div>}>
              <LazyDiagram shape={(chordDb as Record<string, any>)[hover.name]} label={hover.name} />
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
}


