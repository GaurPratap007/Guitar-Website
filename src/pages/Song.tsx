import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchIndex } from '../lib/contentLoader';
import { ParsedLine, SongContent } from '../types';
import ChordBlock from '../components/ChordBlock';
import AutoscrollControls from '../components/AutoscrollControls';
const LazyYouTube = React.lazy(() => import('../components/YouTubePlayer'));
const LazyDiagram = React.lazy(() => import('../components/ChordDiagram'));
import chordDb from '../data/chords.json';
import { applyCapo, preferredAccidentalForKey, transposeChordName } from '../lib/transpose';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function Song(): JSX.Element {
  const { id } = useParams();
  const [song, setSong] = useState<SongContent | null>(null);
  const [displayMode, setDisplayMode] = useState<'combined' | 'chords' | 'lyrics'>('combined');
  const [transpose, setTranspose] = useState<number>(() => Number(localStorage.getItem('pref_transpose') ?? 0));
  const [capo, setCapo] = useState<number>(() => Number(localStorage.getItem('pref_capo') ?? 0));
  const [followVideo, setFollowVideo] = useState<boolean>(false);
  const contentRef = useRef<HTMLElement>(null);
  const scrollTargetRef = useRef<'top' | 'center' | 'bottom'>('center');
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);

  useEffect(() => {
    fetchIndex().then(d => {
      const s = d.songs[id!];
      setSong(s ?? null);
    });
  }, [id]);

  useEffect(() => {
    localStorage.setItem('pref_transpose', String(transpose));
  }, [transpose]);
  useEffect(() => {
    localStorage.setItem('pref_capo', String(capo));
  }, [capo]);

  const preferFlats = useMemo(() => song ? preferredAccidentalForKey(song.frontmatter.key) === 'flats' : false, [song]);

  function scrollToLine(lineIndex: number) {
    if (!contentRef.current) return;
    const el = contentRef.current.querySelector(`[data-line-index="${lineIndex}"]`) as HTMLElement | null;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const containerRect = contentRef.current.getBoundingClientRect();
    let offset = 0;
    if (scrollTargetRef.current === 'center') offset = containerRect.height / 2 - rect.height / 2;
    if (scrollTargetRef.current === 'bottom') offset = containerRect.height - rect.height - 16;
    contentRef.current.scrollBy({ top: rect.top - containerRect.top - 16 - offset, behavior: 'smooth' });
  }

  useEffect(() => {
    if (!song || !followVideo || !song.frontmatter.scroll_map) return;
    const map = song.frontmatter.scroll_map;
    const next = [...map].reverse().find(p => currentVideoTime >= p.timeSec);
    if (next) scrollToLine(next.lineIndex);
  }, [currentVideoTime, followVideo, song]);

  if (!song) {
    return <div className="mx-auto max-w-6xl px-4 py-8">Loading…</div>;
  }

  const fm = song.frontmatter;
  const uniqueChords = song.uniqueChords;

  function exportAsPdf() {
    const el = contentRef.current!;
    html2canvas(el as any, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${fm.title}.pdf`);
    });
  }

  function copyMarkdown() {
    // Minimal: copy reconstructed markdown of inline chords
    const lines = song.ast.map(l => {
      if (l.kind === 'inline') {
        return l.tokens.map(t => t.type === 'lyric' ? t.text : t.raw).join('');
      }
      if (l.kind === 'comment') return `# ${l.text}`;
      if (l.kind === 'repeat') return `(x${l.count ?? 2})`;
      return '';
    }).join('\n');
    navigator.clipboard.writeText(lines);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">{fm.title}</h1>
        <div className="text-sm text-gray-700">{fm.artist}{fm.album ? ` · ${fm.album}` : ''}</div>
        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
          <span>Key: <strong>{fm.key}</strong></span>
          <span>Capo: <strong>{fm.capo}</strong></span>
          {fm.tags?.map(t => <span key={t} className="px-2 py-0.5 rounded bg-gray-100">{t}</span>)}
        </div>
        <article
          ref={contentRef as any}
          className="mt-4 p-4 border rounded bg-white max-h-[60vh] md:max-h-[70vh] overflow-auto"
          aria-label="Song content"
        >
          <ChordBlock ast={song.ast} displayMode={displayMode} transpose={transpose} capo={capo} songKey={fm.key} />
        </article>
      </section>

      <aside className="space-y-6 lg:sticky lg:top-16 self-start">
        <div className="space-y-3 border rounded p-4">
          <div className="font-medium">View</div>
          <div className="flex flex-wrap gap-2">
            {(['combined','chords','lyrics'] as const).map(m => (
              <button
                key={m}
                className={`px-2 py-1 border rounded ${displayMode === m ? 'bg-brand-600 text-white' : ''}`}
                onClick={() => setDisplayMode(m)}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm">Transpose</div>
            <button className="px-2 py-1 border rounded" onClick={() => setTranspose(t => t - 1)} aria-label="Transpose down">-</button>
            <div className="text-sm w-10 text-center">{transpose}</div>
            <button className="px-2 py-1 border rounded" onClick={() => setTranspose(t => t + 1)} aria-label="Transpose up">+</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm">Capo</label>
            <input
              type="number"
              className="w-16 border rounded px-2 py-1"
              min={0}
              max={12}
              value={capo}
              onChange={e => setCapo(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-2 py-1 border rounded" onClick={copyMarkdown}>Copy as markdown</button>
            <button className="px-2 py-1 border rounded" onClick={exportAsPdf}>Export PDF</button>
          </div>
        </div>

        <div className="border rounded p-4">
          <div className="font-medium mb-2">Autoscroll</div>
          <AutoscrollControls
            containerRef={contentRef as any}
            followVideo={followVideo}
            onFollowVideoChange={setFollowVideo}
          />
        </div>

        {fm.youtube_id && (
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Tutorial video</div>
            <React.Suspense fallback={<div className="text-sm text-gray-500">Loading video…</div>}>
              <LazyYouTube
                videoId={fm.youtube_id}
                onTime={t => setCurrentVideoTime(t)}
              />
            </React.Suspense>
            {!fm.scroll_map && (
              <p className="mt-2 text-xs text-gray-600">
                No sync map provided. See CONTRIBUTING.md for adding <code>scroll_map</code>.
              </p>
            )}
          </div>
        )}

        <div className="border rounded p-4">
          <div className="font-medium mb-3">Chord diagrams used</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 justify-items-center">
            {uniqueChords.map(ch => {
              const name = applyCapo(transposeChordName(ch, transpose, preferFlats), capo, preferFlats);
              const shape = (chordDb as Record<string, any>)[name] || (chordDb as Record<string, any>)[ch];
              if (!shape) return null;
              return (
                <div key={ch} className="text-center">
                  <div className="border rounded-lg shadow-sm p-2 bg-white">
                    <React.Suspense fallback={<div className="text-xs text-gray-500">…</div>}>
                      <LazyDiagram shape={shape} label={name} size={128} />
                    </React.Suspense>
                  </div>
                  <div className="mt-2">
                    <button
                      className="text-xs px-2 py-0.5 border rounded"
                      onClick={() => navigator.clipboard.writeText(name)}
                    >
                      Copy chord
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="border rounded p-4 text-sm text-gray-700">
          <div className="font-medium mb-1">Contribute</div>
          <p>Add new songs via PR. See CONTRIBUTING.md for format and sync map tips.</p>
        </div>
      </aside>
    </div>
  );
}


