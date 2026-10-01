import { useEffect, useState } from 'react';
import { Heatmap } from '../Heatmap';
import { PageHeader } from '../PageHeader';
import { useSessionContext } from '../SessionContext';
import type { Session } from '../types';

export function HeatmapPage() {
  const { selectedSessionId, setSelectedSessionId } = useSessionContext();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions`)
      .then((res) => res.json())
      .then(setSessions)
      .catch((err) => console.error('Failed to load sessions:', err));
  }, []);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Heatmap"
        subtitle="Where users click most, for a single selected session"
      />
      <div className="p-4 flex-1 flex flex-col min-h-0">
        <div className="mb-4 flex items-center gap-2 shrink-0">
          <label className="text-sm text-gray-400">Session:</label>
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value || null)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">Select a session...</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.page_url} — {new Date(s.start_time + 'Z').toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        {!selectedSessionId ? (
          <div className="text-gray-400">Select a session above to view its heatmap.</div>
        ) : (
          <div className="border border-gray-800 rounded-lg flex-1 overflow-hidden">
            <Heatmap sessionId={selectedSessionId} />
          </div>
        )}
      </div>
    </div>
  );
}