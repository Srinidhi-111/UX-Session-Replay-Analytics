import { useEffect, useRef, useState } from 'react';
import 'rrweb-player/dist/style.css';
import { RageClickMarkers } from './RageClickMarkers';
import type { Session } from './types';

interface ReplayViewerProps {
  sessionId: string;
  session?: Session | null;
  onClose: () => void;
}

export function ReplayViewer({ sessionId, session, onClose }: ReplayViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rageClicks, setRageClicks] = useState<number[]>([]);
  const [sessionBounds, setSessionBounds] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const worker = new Worker(new URL('./replayWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.postMessage({ apiUrl: import.meta.env.VITE_API_URL, sessionId });

    worker.onmessage = async (e: MessageEvent) => {
      const { rrwebEvents, rageClicks } = e.data;

      if (!rrwebEvents || rrwebEvents.length === 0) {
        setError(true);
        setLoading(false);
        return;
      }

      setRageClicks(rageClicks);
      setSessionBounds({
        start: rrwebEvents[0].timestamp,
        end: rrwebEvents[rrwebEvents.length - 1].timestamp,
      });

      const rrwebPlayerModule = await import('rrweb-player');
      const RrwebPlayer = rrwebPlayerModule.default;

      if (containerRef.current) {
        new RrwebPlayer({
          target: containerRef.current,
          props: { events: rrwebEvents, width: 900, height: 600, autoPlay: false },
        });
      }

      setLoading(false);
    };

    return () => worker.terminate();
  }, [sessionId]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-bg border border-gray-800 rounded-lg p-4 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-white font-medium">
              {session?.page_url || 'Session Replay'}
            </p>
            {session && (
              <p className="text-xs text-gray-500">
                {new Date(session.start_time + 'Z').toLocaleString()} ·{' '}
                {(session.duration_ms / 1000).toFixed(1)}s ·{' '}
                <span className={session.rage_click_count > 0 ? 'text-danger' : ''}>
                  {session.rage_click_count} rage click
                  {session.rage_click_count !== 1 ? 's' : ''}
                </span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-sm">
            ✕ Close (Esc)
          </button>
        </div>
        {loading && <div className="text-white p-8">Loading replay...</div>}
        {error && (
          <div className="text-white p-8">No replay data available for this session.</div>
        )}
        {sessionBounds && (
          <RageClickMarkers
            rageClicks={rageClicks}
            sessionStart={sessionBounds.start}
            sessionEnd={sessionBounds.end}
          />
        )}
        <div ref={containerRef}></div>
      </div>
    </div>
  );
}