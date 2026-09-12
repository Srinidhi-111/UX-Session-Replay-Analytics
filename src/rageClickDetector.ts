interface ClickEvent {
  elementId: string;
  x: number;
  y: number;
  timestamp: number;
}

const TIME_WINDOW_MS = 1500;
const PIXEL_RADIUS = 20;
const CLICK_THRESHOLD = 3;

export function createRageClickDetector() {
  let clickHistory: ClickEvent[] = [];

  function isSameSpot(a: ClickEvent, b: ClickEvent): boolean {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy) <= PIXEL_RADIUS;
  }

  function registerClick(click: ClickEvent): boolean {
    clickHistory.push(click);
    clickHistory = clickHistory.filter(
      (c) => click.timestamp - c.timestamp <= TIME_WINDOW_MS
    );
    const matchingClicks = clickHistory.filter(
      (c) => c.elementId === click.elementId && isSameSpot(c, click)
    );
    return matchingClicks.length >= CLICK_THRESHOLD;
  }

  return { registerClick };
}