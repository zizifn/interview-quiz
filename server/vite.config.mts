import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      reporter: ["text", "json-summary", "json"],
      exclude: ["**/node_modules/**", "**/index.ts, ", "vite.config.mts"],
      reportOnFailure: true,
    },
    globals: true,
    restoreMocks: true,
  },
  plugins: [tsconfigPaths()],
});
