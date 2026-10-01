import { useEffect, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import type { Session } from '../types';
import { ReplayViewer } from '../ReplayViewer';
import { StatusBadge } from '../StatusBadge';
import { MetricCards } from '../MetricCards';
import { TopProblemPages } from '../TopProblemPages';
import { PageHeader } from '../PageHeader';
import { SessionRowSkeleton } from '../Skeleton';
import { useLiveSessions } from '../useLiveSessions';
import { useSessionContext } from '../SessionContext';

function formatTimestamp(iso: string): string {
  const hasTimezone = /Z|[+-]\d\d:\d\d$/.test(iso);
  return new Date(hasTimezone ? iso : iso + 'Z').toLocaleString();
}

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { selectedSessionId, setSelectedSessionId } = useSessionContext();
  const [replaySessionId, setReplaySessionId] = useState<string | null>(null);

  const [searchDraft, setSearchDraft] = useState('');
  const [startDateDraft, setStartDateDraft] = useState('');
  const [endDateDraft, setEndDateDraft] = useState('');
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

  const replaySession = sessions.find((s) => s.id === replaySessionId) || null;

  return (
    <div>
      <PageHeader
        title="Sessions"
        subtitle="Every recorded session, with rage-click detection and live updates"
      />
      <MetricCards />
      <TopProblemPages />

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

      {selectedSessionId && (
        <div className="px-4 mb-2 flex items-center gap-2">
          <span className="text-sm text-gray-400">
            Selected session active — view it on the Alerts, Heatmap or Timeline pages too
          </span>
          <button
            onClick={() => setSelectedSessionId(null)}
            className="text-sm text-amber-400 hover:text-amber-300 underline"
          >
            Clear selection
          </button>
        </div>
      )}

      <div
        className="border border-gray-800 rounded-lg overflow-hidden mx-4"
        style={{ height: '500px' }}
      >
        {loading ? (
          <div>
            {Array.from({ length: 6 }).map((_, i) => (
              <SessionRowSkeleton key={i} />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-gray-400 p-8 text-center">
            No sessions yet. Open the demo page and click around to generate one.
          </div>
        ) : (
          <Virtuoso
            style={{ height: '100%' }}
            data={sessions}
            itemContent={(_index, session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSessionId(session.id)}
                className={`flex justify-between items-center p-4 border-b border-gray-800 text-white hover:bg-gray-900 cursor-pointer ${
                  selectedSessionId === session.id
                    ? 'bg-gray-900 border-l-2 border-l-amber-400'
                    : ''
                }`}
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
                      session.rage_click_count > 0 ? 'text-danger font-bold' : 'text-gray-500'
                    }
                  >
                    {session.rage_click_count} rage click
                    {session.rage_click_count !== 1 ? 's' : ''}
                  </div>
                  <StatusBadge status={session.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setReplaySessionId(session.id);
                    }}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded"
                  >
                    ▶ Replay
                  </button>
                </div>
              </div>
            )}
          />
        )}
      </div>

      {replaySessionId && (
        <ReplayViewer
          sessionId={replaySessionId}
          session={replaySession}
          onClose={() => setReplaySessionId(null)}
        />
      )}
    </div>
  );
}