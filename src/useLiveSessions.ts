import { useEffect } from 'react';
import type { Session } from './types';
import { useLive } from './LiveContext';

export function useLiveSessions(setSessions: React.Dispatch<React.SetStateAction<Session[]>>) {
  const { lastUpdate } = useLive();

  useEffect(() => {
    if (!lastUpdate) return;
    const update = lastUpdate;
    const computedStatus = update.rage_click_count >= 3 ? 'RAGE_CLICK' : 'NORMAL';

    setSessions((prev) => {
      const exists = prev.find((s) => s.id === update.session_id);
      if (exists) {
        return prev.map((s) =>
          s.id === update.session_id
            ? { ...s, rage_click_count: update.rage_click_count, status: computedStatus }
            : s
        );
      }
      return [
        {
          id: update.session_id,
          page_url: update.page_url,
          start_time: new Date().toISOString(),
          end_time: null,
          rage_click_count: update.rage_click_count,
          device_type: null,
          duration_ms: 0,
          status: computedStatus,
        },
        ...prev,
      ];
    });
  }, [lastUpdate, setSessions]);
}