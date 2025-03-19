import { vi } from "vitest";

// Set up global test environment
global.console = {
  ...console,
  // Uncomment the following to debug tests
  // log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};
