import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface LiveUpdate {
  session_id: string;
  page_url: string;
  rage_click_count: number;
}

interface LiveContextType {
  status: 'connecting' | 'open' | 'closed';
  lastUpdate: LiveUpdate | null;
}

const LiveContext = createContext<LiveContextType>({ status: 'closed', lastUpdate: null });

export function LiveProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<LiveUpdate | null>(null);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/live`);

    ws.onopen = () => setStatus('open');
    ws.onclose = () => setStatus('closed');
    ws.onerror = () => setStatus('closed');
    ws.onmessage = (event) => {
      setLastUpdate(JSON.parse(event.data));
    };

    return () => ws.close();
  }, []);

  return (
    <LiveContext.Provider value={{ status, lastUpdate }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  return useContext(LiveContext);
}