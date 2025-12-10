import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collectFacets, fetchIndex, filterEntries, makeSearch } from '../lib/contentLoader';
import type { SearchIndexEntry } from '../types';

export default function Home(): JSX.Element {
  const [entries, setEntries] = useState<SearchIndexEntry[]>([]);
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState<{ artist?: string; key?: string; capo?: number; tags?: string[] }>({});

  useEffect(() => {
    fetchIndex().then(d => setEntries(d.entries));
  }, []);

  const facets = useMemo(() => collectFacets(entries), [entries]);
  const fuse = useMemo(() => makeSearch(entries), [entries]);

  const filtered = useMemo(() => {
    const base = filterEntries(entries, filters);
    if (!q) return base;
    return fuse.search(q).map(r => r.item).filter(e => base.some(b => b.id === e.id));
  }, [entries, filters, q, fuse]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Songs</h1>
        <p className="text-gray-600 text-sm">Search and filter. Example content only.</p>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end mb-6">
        <input
          type="search"
          placeholder="Search title, artist, tags…"
          className="md:col-span-2 border rounded px-3 py-2"
          value={q}
          onChange={e => setQ(e.target.value)}
          aria-label="Search songs"
        />
        <select
          className="border rounded px-2 py-2"
          value={filters.artist ?? ''}
          onChange={e => setFilters(f => ({ ...f, artist: e.target.value || undefined }))}
          aria-label="Filter by artist"
        >
          <option value="">All artists</option>
          {facets.artists.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select
          className="border rounded px-2 py-2"
          value={filters.key ?? ''}
          onChange={e => setFilters(f => ({ ...f, key: e.target.value || undefined }))}
          aria-label="Filter by key"
        >
          <option value="">All keys</option>
          {facets.keys.map(k => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(e => (
          <li key={e.id} className="border rounded-lg p-4 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <Link to={`/song/${e.id}`} className="font-medium text-brand-700 hover:underline" aria-label={`Open ${e.title} by ${e.artist}`}>
                {e.title}
              </Link>
              <span className="text-xs text-gray-500">Key {e.key}{e.capo ? ` (capo ${e.capo})` : ''}</span>
            </div>
            <div className="text-sm text-gray-700 mt-1">{e.artist}</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {(e.tags ?? []).map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">{t}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


