import { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Session } from './types';
import { ReplayViewer } from './ReplayViewer';
import { StatusBadge } from './StatusBadge';
import { MetricCards } from './MetricCards';
import { Heatmap } from './Heatmap';
import { useLiveSessions } from './useLiveSessions';
import { RageAlerts } from './RageAlerts';

function formatTimestamp(iso: string): string {
  const hasTimezone = /Z|[+-]\d\d:\d\d$/.test(iso);
  return new Date(hasTimezone ? iso : iso + 'Z').toLocaleString();
}

export function SessionList() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Draft values — update as you type/pick, but don't trigger a fetch yet
  const [searchDraft, setSearchDraft] = useState('');
  const [startDateDraft, setStartDateDraft] = useState('');
  const [endDateDraft, setEndDateDraft] = useState('');

  // Applied values — only these actually trigger the fetch
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  function applyFilters() {
    setSearch(searchDraft);
    setStartDate(startDateDraft);
    setEndDate(endDateDraft);
  }

  function clearFilters() {
    setSearchDraft('');
    setStartDateDraft('');
    setEndDateDraft('');
    setSearch('');
    setStartDate('');
    setEndDate('');
  }

  useEffect(() => {
    setLoading(true);
    const url = new URL(`${import.meta.env.VITE_API_URL}/api/sessions`);
    if (search) url.searchParams.set('search', search);
    if (startDate) url.searchParams.set('start_date', startDate);
    if (endDate) url.searchParams.set('end_date', endDate);

    fetch(url.toString())
      .then((res) => res.json())
      .then((data) => {
        setSessions(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sessions:', err);
        setLoading(false);
      });
  }, [search, startDate, endDate]);

  useLiveSessions(setSessions);

  return (
    <div className="h-screen bg-bg overflow-y-auto">
      <MetricCards />

      {selectedSessionId && (
        <div className="px-4 mb-2 flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Filtering by selected session
          </span>
          <button
            onClick={() => setSelectedSessionId(null)}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            Clear filter (view all)
          </button>
        </div>
      )}

      <div className="px-4 mb-4 flex gap-3 items-center flex-wrap">
        <input
          type="text"
          placeholder="Search by page URL... (press Enter)"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') applyFilters();
          }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm flex-1 min-w-[200px]"
        />
        <input
          type="date"
          value={startDateDraft}
          onChange={(e) => setStartDateDraft(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
        />
        <span className="text-gray-500 text-sm">to</span>
        <input
          type="date"
          value={endDateDraft}
          onChange={(e) => setEndDateDraft(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-white text-sm"
        />
        <button
          onClick={applyFilters}
          className="bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium px-4 py-2 rounded-lg"
        >
          Search
        </button>
        {(search || startDate || endDate) && (
          <button
            onClick={clearFilters}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 px-4 mb-4">
        <div
          className="border border-gray-800 rounded-lg overflow-hidden"
          style={{ height: '380px' }}
        >
          {loading ? (
            <div className="text-white p-4">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-white p-4">No sessions match your filters.</div>
          ) : (
            <Virtuoso
              style={{ height: '100%' }}
              data={sessions}
              itemContent={(_index, session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className="flex justify-between items-center p-4 border-b border-gray-800 text-white hover:bg-gray-900 cursor-pointer"
                >
                  <div>
                    <div className="font-medium">{session.page_url}</div>
                    <div className="text-sm text-gray-400">
                      {formatTimestamp(session.start_time)} ·{' '}
                      {(session.duration_ms / 1000).toFixed(1)}s
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        session.rage_click_count > 0
                          ? 'text-danger font-bold'
                          : 'text-gray-500'
                      }
                    >
                      {session.rage_click_count} rage click
                      {session.rage_click_count !== 1 ? 's' : ''}
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              )}
            />
          )}
        </div>

        <div className="border border-gray-800 rounded-lg" style={{ height: '500px', overflowY: 'auto' }}>
          <RageAlerts sessionId={selectedSessionId} />
        </div>
      </div>

      <div className="border border-gray-800 rounded-lg mx-4">
        <Heatmap sessionId={selectedSessionId} />
      </div>

      {selectedSessionId && (
        <ReplayViewer
          sessionId={selectedSessionId}
          onClose={() => setSelectedSessionId(null)}
        />
      )}
    </div>
  );
}