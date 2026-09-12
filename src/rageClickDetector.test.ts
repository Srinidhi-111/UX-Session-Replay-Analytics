import { describe, it, expect } from 'vitest';
import { createRageClickDetector } from './rageClickDetector';

describe('rage click detector', () => {
  it('flags 3 rapid clicks on the same element as a rage click', () => {
    const detector = createRageClickDetector();
    const base = { elementId: 'submit-btn', x: 100, y: 100 };

    expect(detector.registerClick({ ...base, timestamp: 0 })).toBe(false);
    expect(detector.registerClick({ ...base, timestamp: 300 })).toBe(false);
    expect(detector.registerClick({ ...base, timestamp: 600 })).toBe(true);
  });

  it('does not flag clicks spread far apart in time', () => {
    const detector = createRageClickDetector();
    const base = { elementId: 'submit-btn', x: 100, y: 100 };

    expect(detector.registerClick({ ...base, timestamp: 0 })).toBe(false);
    expect(detector.registerClick({ ...base, timestamp: 2000 })).toBe(false);
    expect(detector.registerClick({ ...base, timestamp: 4000 })).toBe(false);
  });

  it('does not flag clicks on different elements', () => {
    const detector = createRageClickDetector();

    detector.registerClick({ elementId: 'btn-a', x: 100, y: 100, timestamp: 0 });
    detector.registerClick({ elementId: 'btn-b', x: 500, y: 500, timestamp: 100 });
    expect(
      detector.registerClick({ elementId: 'btn-a', x: 100, y: 100, timestamp: 200 })
    ).toBe(false);
  });
});