import { createRageClickDetector } from './rageClickDetector';

const detector = createRageClickDetector();

function getElementId(el: Element): string {
  return el.id || el.tagName + (el.className ? `.${el.className}` : '');
}

document.addEventListener('click', (e) => {
  const isRageClick = detector.registerClick({
    elementId: getElementId(e.target as Element),
    x: e.clientX,
    y: e.clientY,
    timestamp: Date.now(),
  });

  if (isRageClick) {
    console.log('🔴 Rage click detected on:', getElementId(e.target as Element));
  }
});