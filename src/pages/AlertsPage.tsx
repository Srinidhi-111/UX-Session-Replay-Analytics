import { useEffect, useState } from 'react';
import { RageAlerts } from '../RageAlerts';
import { PageHeader } from '../PageHeader';
import { useSessionContext } from '../SessionContext';
import type { Session } from '../types';

export function AlertsPage() {
  const { selectedSessionId, setSelectedSessionId } = useSessionContext();
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions`)
      .then((res) => res.json())
      .then(setSessions)
      .catch((err) => console.error('Failed to load sessions:', err));
  }, []);

  return (
    <div>
      <PageHeader
        title="Rage Click Alerts"
        subtitle="Recent frustration signals, ranked by severity"
      />
      <div className="p-4">
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <label className="text-sm text-gray-400">Session:</label>
          <select
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(e.target.value || null)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="">All sessions</option>
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.page_url} — {new Date(s.start_time + 'Z').toLocaleString()}
              </option>
            ))}
          </select>
          {selectedSessionId && (
            <button
              onClick={() => setSelectedSessionId(null)}
              className="text-sm text-amber-400 hover:text-amber-300 underline"
            >
              Clear (view all)
            </button>
          )}
        </div>
        <div className="border border-gray-800 rounded-lg" style={{ minHeight: '500px' }}>
          <RageAlerts sessionId={selectedSessionId} />
        </div>
      </div>
    </div>
  );
}