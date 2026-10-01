import { useEffect, useRef } from 'react';
import { useLive } from './LiveContext';
import { useToast } from './Toast';

export function RageClickToastWatcher() {
  const { lastUpdate } = useLive();
  const { showToast } = useToast();
  const prevCounts = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!lastUpdate) return;
    const prev = prevCounts.current[lastUpdate.session_id] || 0;
    if (lastUpdate.rage_click_count > prev && lastUpdate.rage_click_count >= 3) {
      showToast(`Rage click detected on ${lastUpdate.page_url}`, 'danger');
    }
    prevCounts.current[lastUpdate.session_id] = lastUpdate.rage_click_count;
  }, [lastUpdate, showToast]);

  return null;
}