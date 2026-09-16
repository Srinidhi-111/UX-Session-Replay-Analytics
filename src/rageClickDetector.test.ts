import { describe, it, expect } from 'vitest';
import { createRageClickDetector } from './rageClickDetector';

describe('rage click detector', () => {
  it('escalates severity as clicks pile up on the same element', () => {
    const detector = createRageClickDetector();
    const base = { elementId: 'submit-btn', x: 100, y: 100 };

    expect(detector.registerClick({ ...base, timestamp: 0 })).toBe('none');
    expect(detector.registerClick({ ...base, timestamp: 200 })).toBe('medium');
    expect(detector.registerClick({ ...base, timestamp: 400 })).toBe('high');
    expect(detector.registerClick({ ...base, timestamp: 600 })).toBe('high');
    expect(detector.registerClick({ ...base, timestamp: 800 })).toBe('critical');
  });

  it('does not escalate clicks spread far apart in time', () => {
    const detector = createRageClickDetector();
    const base = { elementId: 'submit-btn', x: 100, y: 100 };

    expect(detector.registerClick({ ...base, timestamp: 0 })).toBe('none');
    expect(detector.registerClick({ ...base, timestamp: 2000 })).toBe('none');
    expect(detector.registerClick({ ...base, timestamp: 4000 })).toBe('none');
  });

  it('tracks different elements independently', () => {
    const detector = createRageClickDetector();

    detector.registerClick({ elementId: 'btn-a', x: 100, y: 100, timestamp: 0 });
    detector.registerClick({ elementId: 'btn-b', x: 500, y: 500, timestamp: 100 });
    expect(
      detector.registerClick({ elementId: 'btn-a', x: 100, y: 100, timestamp: 200 })
    ).toBe('medium'); // 2 clicks on btn-a so far, unaffected by btn-b
  });
});