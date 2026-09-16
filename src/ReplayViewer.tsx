import { useEffect, useRef, useState } from 'react';
import 'rrweb-player/dist/style.css';
import { RageClickMarkers } from './RageClickMarkers';

interface ReplayViewerProps {
  sessionId: string;
  onClose: () => void;
}

export function ReplayViewer({ sessionId, onClose }: ReplayViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [rageClicks, setRageClicks] = useState<number[]>([]);
  const [sessionBounds, setSessionBounds] = useState<{ start: number; end: number } | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('./replayWorker.ts', import.meta.url), {
      type: 'module',
    });

    worker.postMessage({
      apiUrl: import.meta.env.VITE_API_URL,
      sessionId,
    });

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
          props: {
            events: rrwebEvents,
            width: 900,
            height: 600,
            autoPlay: false,
          },
        });
      }

      setLoading(false);
    };

    return () => worker.terminate();
  }, [sessionId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-bg border border-gray-800 rounded p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-white font-medium">Session Replay</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            Close
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