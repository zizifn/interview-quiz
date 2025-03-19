import { defineConfig } from "vitest/config";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      enabled: true,
      reporter: ["text", "html", "json-summary", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/node_modules/**",
        "**/index.ts, ",
        "vite.config.mts",
        "src/db/**",
      ],
      reportOnFailure: true,
    },
    environment: "node",
    reporters: ["verbose"],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
