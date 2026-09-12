import { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Session } from './types';

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/sessions`)
      .then((res) => res.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sessions:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-white p-4">Loading sessions...</div>;
  }

  if (sessions.length === 0) {
    return <div className="text-white p-4">No sessions recorded yet.</div>;
  }

  return (
    <div className="h-screen bg-bg">
      <Virtuoso
        style={{ height: '100%' }}
        data={sessions}
        itemContent={(index, session) => (
          <div
            key={session.id}
            className="flex justify-between items-center p-4 border-b border-gray-800 text-white hover:bg-gray-900 cursor-pointer"
          >
            <div>
              <div className="font-medium">{session.page_url}</div>
              <div className="text-sm text-gray-400">
                {new Date(session.start_time).toLocaleString()}
              </div>
            </div>
            <div
              className={
                session.rage_click_count > 0
                  ? 'text-danger font-bold'
                  : 'text-gray-500'
              }
            >
              {session.rage_click_count} rage click{session.rage_click_count !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      />
    </div>
  );
}