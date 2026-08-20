// backend/vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    testTimeout: 15000,
    hookTimeout: 15000,
    sequence: {
      concurrent: false,
    },
  },
  resolve: {
    alias: {
      "@domain": path.resolve(import.meta.dirname, "./src/domain/index.ts"),
    },
  },
});