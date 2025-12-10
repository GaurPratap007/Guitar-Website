import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export interface ScrollMapPoint {
  timeSec: number;
  lineIndex: number;
}

export interface YouTubePlayerProps {
  videoId: string;
  onTime?: (t: number) => void;
  onPlayState?: (playing: boolean) => void;
  enablePiP?: boolean;
}

export default function YouTubePlayer({ videoId, onTime, onPlayState }: YouTubePlayerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    function load() {
      if (window.YT && window.YT.Player) {
        init();
        return;
      }
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      window.onYouTubeIframeAPIReady = () => init();
    }
    function init() {
      if (!mounted) return;
      playerRef.current = new window.YT.Player(containerRef.current!, {
        height: '100%',
        width: '100%',
        videoId,
        playerVars: { rel: 0 },
        events: {
          onReady: () => setReady(true),
          onStateChange: (ev: any) => {
            const playing = ev.data === window.YT.PlayerState.PLAYING;
            onPlayState?.(playing);
          }
        }
      });
    }
    load();
    return () => {
      mounted = false;
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
    };
  }, [videoId, onPlayState]);

  useEffect(() => {
    if (!ready) return;
    let id: number | null = null;
    const tick = () => {
      const t = playerRef.current?.getCurrentTime?.();
      if (typeof t === 'number') onTime?.(t);
      id = window.requestAnimationFrame(tick);
    };
    id = window.requestAnimationFrame(tick);
    return () => {
      if (id) cancelAnimationFrame(id);
    };
  }, [ready, onTime]);

  return (
    <div className="space-y-2">
      <div className="relative w-full aspect-video">
        <div ref={containerRef} className="absolute inset-0" />
      </div>
      <div className="flex gap-2">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => playerRef.current?.playVideo?.()}
        >
          Play
        </button>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => playerRef.current?.pauseVideo?.()}
        >
          Pause
        </button>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => {
            const url = `https://www.youtube.com/watch?v=${videoId}`;
            window.open(url, '_blank', 'noopener');
          }}
        >
          Pop out
        </button>
      </div>
    </div>
  );
}


