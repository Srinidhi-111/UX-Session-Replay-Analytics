import { createRageClickDetector } from './rageClickDetector';

const API_URL = import.meta.env.VITE_API_URL;
const detector = createRageClickDetector();
const sessionId = crypto.randomUUID();
let eventBuffer: any[] = [];

function getElementId(el: Element): string {
  return el.id || el.tagName + (el.className ? `.${el.className}` : '');
}

document.addEventListener('click', (e) => {
  const elementId = getElementId(e.target as Element);
  const isRageClick = detector.registerClick({
    elementId,
    x: e.clientX,
    y: e.clientY,
    timestamp: Date.now(),
  });

  eventBuffer.push({ type: isRageClick ? 'rage_click' : 'click', elementId });
});

function sendEvents() {
  if (eventBuffer.length === 0) return;

  const payload = JSON.stringify({
    page_url: window.location.href,
    events: eventBuffer,
  });

  navigator.sendBeacon(
    `${API_URL}/api/sessions/${sessionId}/events`,
    new Blob([payload], { type: 'application/json' })
  );

  eventBuffer = [];
}

// Send every 3 seconds, and also on page close
setInterval(sendEvents, 3000);
window.addEventListener('beforeunload', sendEvents);