import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectUniqueChordsFromAst, saveLocalSong } from '../lib/contentLoader';
import { parseTextToAst } from '../lib/chordParser';
import type { ParsedLine, SongContent } from '../types';
import { extractYouTubeId } from '../lib/youtube';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function AddSong(): JSX.Element {
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [keySig, setKeySig] = useState('C');
  const [capo, setCapo] = useState<number>(0);
  const [youtubeId, setYoutubeId] = useState('');
  const [tagsText, setTagsText] = useState('');
  const [strum, setStrum] = useState('');
  const [notes, setNotes] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [idOverride, setIdOverride] = useState('');
  const [autoId, setAutoId] = useState('');

  useEffect(() => {
    const slug = slugify(`${title}-${artist}`.trim());
    setAutoId(slug || '');
  }, [title, artist]);

  const bodyWithMeta = useMemo(() => {
    const pre: string[] = [];
    if (strum.trim()) pre.push(`# Strum: ${strum.trim()}`);
    if (notes.trim()) pre.push(`# Notes: ${notes.trim()}`);
    return [pre.join('\n'), pre.length ? '' : '', lyrics].filter(Boolean).join('\n');
  }, [strum, notes, lyrics]);

  const ast: ParsedLine[] = useMemo(() => parseTextToAst(bodyWithMeta), [bodyWithMeta]);
  const uniqueChords = useMemo(() => collectUniqueChordsFromAst(ast), [ast]);
  const tags = useMemo(
    () => tagsText.split(',').map(t => t.trim()).filter(Boolean),
    [tagsText]
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = (idOverride || autoId || slugify(title) || `song-${Date.now()}`);
    const normalizedYoutubeId = extractYouTubeId(youtubeId.trim()) ?? undefined;
    const song: SongContent = {
      frontmatter: {
        id,
        title: title.trim(),
        artist: artist.trim(),
        key: keySig.trim(),
        capo: Number(capo) || 0,
        youtube_id: normalizedYoutubeId,
        tags: tags.length ? tags : undefined
      },
      ast,
      uniqueChords
    };
    saveLocalSong(song);
    nav(`/song/${id}`);
  }

  function exportMarkdown() {
    const id = (idOverride || autoId || slugify(title) || `song-${Date.now()}`);
    const normalizedYoutubeId = extractYouTubeId(youtubeId.trim()) ?? '';
    const fm = [
      '---',
      `id: ${id}`,
      `title: ${title.trim()}`,
      `artist: ${artist.trim()}`,
      `key: ${keySig.trim()}`,
      `capo: ${Number(capo) || 0}`,
      normalizedYoutubeId ? `youtube_id: ${normalizedYoutubeId}` : '',
      tags.length ? `tags: [${tags.map(t => `"${t}"`).join(', ')}]` : '',
      '---',
      ''
    ].filter(Boolean).join('\n');
    const content = [fm, bodyWithMeta].join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${id}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const idDisplay = idOverride || autoId || '(will generate)';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Add New Song</h1>
        <p className="text-gray-600 text-sm">Paste lyrics with inline chords like [C]Hello [G]world. Provide metadata and submit.</p>
      </div>
      <form onSubmit={onSubmit} className="grid lg:grid-cols-2 gap-6">
        <section className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Title</label>
              <input className="w-full border rounded px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Artist</label>
              <input className="w-full border rounded px-3 py-2" value={artist} onChange={e => setArtist(e.target.value)} required />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Key</label>
              <input className="w-full border rounded px-3 py-2" value={keySig} onChange={e => setKeySig(e.target.value)} placeholder="e.g. C, F#, Bb" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Capo</label>
              <input type="number" min={0} max={12} className="w-full border rounded px-3 py-2" value={capo} onChange={e => setCapo(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">YouTube ID (optional)</label>
              <input className="w-full border rounded px-3 py-2" value={youtubeId} onChange={e => setYoutubeId(e.target.value)} placeholder="e.g. https://youtu.be/dQw4w9WgXcQ or dQw4w9WgXcQ" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tags (comma separated)</label>
              <input className="w-full border rounded px-3 py-2" value={tagsText} onChange={e => setTagsText(e.target.value)} placeholder="hindi, indie, acoustic" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Custom ID (optional)</label>
              <input className="w-full border rounded px-3 py-2" value={idOverride} onChange={e => setIdOverride(e.target.value)} placeholder={autoId || 'auto from title-artist'} />
              <div className="text-xs text-gray-500 mt-1">Resulting ID: <code>{idDisplay}</code></div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Strum pattern</label>
              <input className="w-full border rounded px-3 py-2" value={strum} onChange={e => setStrum(e.target.value)} placeholder="e.g. DDU UDU" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Additional notes</label>
              <input className="w-full border rounded px-3 py-2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any helpful tips..." />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Lyrics + chords</label>
            <textarea
              className="w-full border rounded px-3 py-2 min-h-[12rem]"
              value={lyrics}
              onChange={e => setLyrics(e.target.value)}
              placeholder="Example:&#10;# Verse&#10;[C]Hello [G]world&#10;[Am]How are [F]you"
              required
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="submit" className="px-3 py-2 border rounded bg-brand-600 text-white">Save & open</button>
            <button type="button" className="px-3 py-2 border rounded" onClick={exportMarkdown}>Export .md</button>
          </div>
        </section>
        <aside className="space-y-4">
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Detected chords</div>
            {uniqueChords.length === 0 ? (
              <div className="text-sm text-gray-500">No chords yet. Use [C], [G], [Am], etc.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {uniqueChords.map(ch => (
                  <span key={ch} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{ch}</span>
                ))}
              </div>
            )}
          </div>
          <div className="border rounded p-4">
            <div className="font-medium mb-2">Preview (first 12 lines)</div>
            <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-64">
              {bodyWithMeta.split('\n').slice(0, 12).join('\n')}
            </pre>
          </div>
        </aside>
      </form>
    </div>
  );
}


