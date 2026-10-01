import { useEffect, useState } from 'react';
import { PageHeader } from '../PageHeader';
import { useSessionContext } from '../SessionContext';
import type { Session } from '../types';

interface TimelineEntry {
  label: string;
  timestamp: number;
  isRage: boolean;
}

function describeRrwebEvent(event: any): string | null {
  if (event.type === 4) return 'Page loaded';
  if (event.type === 2) return 'Full page snapshot recorded';
  if (event.type === 3 && event.data?.source === 0) return 'Page content changed';
  return null;
}

export function TimelinePage() {
  const { selectedSessionId, setSelectedSessionId } = useSessionContext();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions`)
      .then((res) => res.json())
      .then(setSessions)
      .catch((err) => console.error('Failed to load sessions:', err));
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setEntries([]);
      return;
    }
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions/${selectedSessionId}/raw`)
      .then((res) => res.json())
      .then((rawEvents: any[]) => {
        const built: TimelineEntry[] = [];
        for (const item of rawEvents) {
          if (item.source === 'custom') {
            if (item.type === 'rage_click') {
              built.push({
                label: `Rage click on ${item.elementId} (${item.severity?.toUpperCase() || 'MEDIUM'})`,
                timestamp: item.timestamp,
                isRage: true,
              });
            } else if (item.type === 'click') {
              built.push({
                label: `Clicked ${item.elementId}`,
                timestamp: item.timestamp,
                isRage: false,
              });
            }
          } else if (item.source === 'rrweb') {
            const desc = describeRrwebEvent(item.event);
            if (desc) {
              built.push({ label: desc, timestamp: item.event.timestamp, isRage: false });
            }
          }
        }
        built.sort((a, b) => a.timestamp - b.timestamp);
        setEntries(built);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load timeline:', err);
        setLoading(false);
      });
  }, [selectedSessionId]);

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Timeline"
        subtitle="A chronological log of everything that happened in a session"
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
          <div className="text-gray-400">Select a session above to view its timeline.</div>
        ) : loading ? (
          <div className="text-gray-400">Loading timeline...</div>
        ) : entries.length === 0 ? (
          <div className="text-gray-400">No timeline events recorded.</div>
        ) : (
          <div className="border border-gray-800 rounded-lg p-6 flex-1 overflow-y-auto">
            <div className="relative pl-6 max-w-2xl">
              <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-800" />
              {entries.map((entry, i) => (
                <div key={i} className="relative mb-4 last:mb-0">
                  <div
                    className={`absolute -left-4 top-1 w-3 h-3 rounded-full ${
                      entry.isRage ? 'bg-danger' : 'bg-gray-600'
                    }`}
                  />
                  <div className={entry.isRage ? 'text-danger font-medium' : 'text-white'}>
                    {entry.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}