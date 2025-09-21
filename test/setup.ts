import '@testing-library/jest-dom/vitest';

// Polyfill ResizeObserver used by Radix UI components (e.g., Slider)
class RO {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || (RO as any);

