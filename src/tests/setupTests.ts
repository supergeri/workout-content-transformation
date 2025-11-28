// Global Vitest setup for the UI.
// This file runs before every test suite.

/**
 * Minimal in-memory localStorage mock so storage-related tests
 * can run in Vitest's jsdom environment.
 */
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
};

Object.defineProperty(globalThis, "localStorage", {
  value: createLocalStorageMock(),
  writable: true,
});

/**
 * You can extend this file later with:
 * - MSW setup for API mocking
 * - window.matchMedia, ResizeObserver, etc. shims
 */

export {};
