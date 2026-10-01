import { useEffect, useState } from 'react';

interface Alert {
  element_id: string;
  severity: string;
  timestamp: number;
}

interface RageAlertsProps {
  sessionId: string | null;
}

const severityStyles: Record<string, { badge: string; card: string }> = {
  CRITICAL: {
    badge: 'bg-red-500/15 text-red-400 ring-1 ring-inset ring-red-500/30',
    card: 'border-l-red-500 shadow-[0_0_18px_-8px_rgba(239,68,68,0.6)]',
  },
  HIGH: {
    badge: 'bg-orange-500/15 text-orange-400 ring-1 ring-inset ring-orange-500/30',
    card: 'border-l-orange-500',
  },
  MEDIUM: {
    badge: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-inset ring-yellow-500/30',
    card: 'border-l-yellow-500',
  },
};

export function RageAlerts({ sessionId }: RageAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = () => {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/rage-clicks`);
      if (sessionId) url.searchParams.set('session_id', sessionId);

      fetch(url.toString())
        .then((res) => res.json())
        .then(setAlerts)
        .catch((err) => console.error('Failed to load rage clicks:', err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <div className="p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1">
        <span className="text-danger">⚠</span> Rage Click Alerts{' '}
        {sessionId ? '(this session)' : '(all sessions)'}
      </p>
      {alerts.length === 0 ? (
        <div className="text-gray-500 text-sm">No alerts yet.</div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const style = severityStyles[alert.severity] || severityStyles.MEDIUM;
            return (
              <div
                key={i}
                className={`bg-gray-900 border border-gray-800 border-l-4 rounded-lg p-3 ${style.card}`}
              >
                <div className="flex justify-between items-start gap-3 mb-1">
                  <p className="text-sm font-mono text-white break-all">
                    {alert.element_id}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${style.badge}`}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}