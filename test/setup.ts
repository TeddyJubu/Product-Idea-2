import '@testing-library/jest-dom/vitest';

// Polyfill ResizeObserver used by Radix UI components (e.g., Slider)
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-expect-error: assign to global for tests
global.ResizeObserver = global.ResizeObserver || RO as any;

