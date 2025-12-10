import React, { useEffect, useRef, useState } from 'react';

export interface AutoscrollControlsProps {
  containerRef: React.RefObject<HTMLElement>;
  followVideo: boolean;
  onFollowVideoChange(v: boolean): void;
  onRequestSyncToIndex?(lineIndex: number): void;
}

// Simple autoscroll with easing; speed in px/sec
export default function AutoscrollControls({
  containerRef,
  followVideo,
  onFollowVideoChange
}: AutoscrollControlsProps): JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(() => {
    const saved = localStorage.getItem('pref_speed');
    return saved ? Number(saved) : 60;
  });
  const [scrollTarget, setScrollTarget] = useState<'top' | 'center' | 'bottom'>(() => {
    return (localStorage.getItem('pref_scroll_target') as any) ?? 'center';
  });
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number>(0);

  useEffect(() => {
    localStorage.setItem('pref_speed', String(speed));
  }, [speed]);
  useEffect(() => {
    localStorage.setItem('pref_scroll_target', scrollTarget);
  }, [scrollTarget]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.code === 'ArrowUp' || e.code === 'Equal') {
        setSpeed(s => Math.min(360, Math.round((s + 10))));
      } else if (e.code === 'ArrowDown' || e.code === 'Minus') {
        setSpeed(s => Math.max(10, Math.round((s - 10))));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = (ts: number) => {
      if (!lastTsRef.current) lastTsRef.current = ts;
      const delta = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      const el = containerRef.current;
      if (el) {
        const add = speed * delta;
        const behavior: ScrollBehavior = prefersReduced ? 'auto' : 'smooth';
        el.scrollBy({ top: add, behavior });
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = 0;
    };
  }, [isPlaying, speed, containerRef]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          className="px-3 py-1 rounded bg-brand-600 text-white hover:bg-brand-700"
          onClick={() => setIsPlaying(p => !p)}
          aria-pressed={isPlaying}
        >
          {isPlaying ? 'Pause' : 'Play'} Autoscroll
        </button>
        <label className="text-sm text-gray-700">
          Speed: <span className="font-medium">{speed} px/s</span>
        </label>
      </div>
      <input
        type="range"
        min={10}
        max={360}
        step={10}
        value={speed}
        onChange={e => setSpeed(Number(e.target.value))}
        aria-label="Autoscroll speed"
        className="w-full"
      />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={followVideo} onChange={e => onFollowVideoChange(e.target.checked)} />
          Follow video
        </label>
        <label className="text-sm">
          Scroll margin:
          <select
            className="ml-2 border rounded px-2 py-1"
            value={scrollTarget}
            onChange={e => setScrollTarget(e.target.value as any)}
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>
      </div>
    </div>
  );
}


