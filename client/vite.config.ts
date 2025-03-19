import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    coverage: {
      enabled: true,
      reporter: ["text", "html", "json-summary", "json"],
      exclude: ["**/node_modules/**", "**/index.ts, ", "vite.config.mts"],
      reportOnFailure: true,
    },
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
} as UserConfig);
