import { defineConfig } from "vitest/config";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    reporters: ["verbose"],
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
  },
});
