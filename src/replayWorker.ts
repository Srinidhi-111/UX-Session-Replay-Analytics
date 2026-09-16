self.onmessage = async (e: MessageEvent<{ apiUrl: string; sessionId: string }>) => {
  const { apiUrl, sessionId } = e.data;

  const res = await fetch(`${apiUrl}/api/sessions/${sessionId}/replay`);
  const rrwebEvents = await res.json();

  const rawRes = await fetch(`${apiUrl}/api/sessions/${sessionId}/raw`);
  const rawEvents = await rawRes.json();

  const rageClicks = rawEvents
    .filter((e: any) => e.source === 'custom' && e.type === 'rage_click')
    .map((e: any) => e.timestamp);

  self.postMessage({ rrwebEvents, rageClicks });
};