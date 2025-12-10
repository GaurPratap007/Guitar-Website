import React from 'react';
import { ChordShape } from '../types';

export interface ChordDiagramProps {
  shape: ChordShape;
  size?: number; // px width
  showLabel?: boolean;
  label?: string;
}

const NUM_STRINGS_DEFAULT = 6;
const NUM_FRETS = 5;

export default function ChordDiagram({ shape, size = 160, showLabel = true, label }: ChordDiagramProps): JSX.Element {
  const width = size;
  const height = size * 1.2;
  const strings = shape.strings ?? NUM_STRINGS_DEFAULT;
  const baseFret = shape.baseFret ?? shape['display_fret' as any] ?? 1;
  const stringSpacing = width / (strings - 1);
  const fretSpacing = height / (NUM_FRETS + 2); // add space for nut & label

  const fretting = shape.fretting;
  const fingering = shape.fingering ?? [];

  return (
    <svg
      role="img"
      aria-label={`Chord diagram ${label ?? ''}`}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="bg-white text-gray-900"
    >
      {/* Nut or first fret */}
      <rect
        x={0}
        y={fretSpacing}
        width={width}
        height={baseFret === 1 ? 6 : 2}
        fill="currentColor"
        opacity={0.9}
      />
      {/* Frets */}
      {Array.from({ length: NUM_FRETS }).map((_, i) => {
        const y = fretSpacing * (i + 2);
        return <line key={i} x1={0} x2={width} y1={y} y2={y} stroke="currentColor" strokeWidth={1} opacity={0.3} />;
      })}
      {/* Strings */}
      {Array.from({ length: strings }).map((_, i) => {
        const x = i * stringSpacing;
        return <line key={i} x1={x} x2={x} y1={fretSpacing} y2={fretSpacing * (NUM_FRETS + 1)} stroke="currentColor" strokeWidth={1} opacity={0.6} />;
      })}
      {/* Fingering dots/open/muted */}
      {fretting.map((fret, i) => {
        const x = i * stringSpacing;
        if (fret === 'x') {
          return (
            <text key={`x-${i}`} x={x} y={fretSpacing * 0.7} textAnchor="middle" fontSize={12} fill="currentColor">x</text>
          );
        }
        if (fret === 0) {
          return (
            <circle key={`o-${i}`} cx={x} cy={fretSpacing * 0.7} r={5} stroke="currentColor" fill="none" />
          );
        }
        const y = fretSpacing * (fret - 0.5);
        const finger = fingering[i];
        return (
          <g key={`f-${i}`}>
            <circle cx={x} cy={y + fretSpacing} r={8} fill="currentColor" opacity={0.85} />
            {finger ? (
              <text x={x} y={y + fretSpacing + 4} textAnchor="middle" fontSize={10} fill="white">{finger}</text>
            ) : null}
          </g>
        );
      })}
      {/* Base fret label */}
      {baseFret > 1 && (
        <text x={width - 4} y={fretSpacing - 6} textAnchor="end" fontSize={10} fill="currentColor">
          {`${baseFret}fr`}
        </text>
      )}
      {/* Chord label */}
      {showLabel && (
        <text x={width / 2} y={height - 6} textAnchor="middle" fontSize={12} fill="currentColor">
          {label ?? shape.label ?? ''}
        </text>
      )}
    </svg>
  );
}


