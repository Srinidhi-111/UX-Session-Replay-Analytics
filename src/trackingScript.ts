import * as rrweb from 'rrweb';
import { createRageClickDetector } from './rageClickDetector';

const API_URL = import.meta.env.VITE_API_URL;
const detector = createRageClickDetector();
const sessionId = crypto.randomUUID();
let eventBuffer: any[] = [];

function getElementId(el: Element): string {
  return el.id || el.tagName + (el.className ? `.${el.className}` : '');
}

// --- Existing rage-click tracking ---
document.addEventListener('click', (e) => {
  const elementId = getElementId(e.target as Element);
  const severity = detector.registerClick({
    elementId,
    x: e.clientX,
    y: e.clientY,
    timestamp: Date.now(),
  });

  eventBuffer.push({
    source: 'custom',
    type: severity !== 'none' ? 'rage_click' : 'click',
    elementId,
    x: e.clientX,
    y: e.clientY,
    severity,
    timestamp: Date.now(),
  });
});

// --- New: rrweb DOM recording ---
rrweb.record({
  emit(event) {
    eventBuffer.push({ source: 'rrweb', event });
  },
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

setInterval(sendEvents, 3000);
window.addEventListener('beforeunload', sendEvents);