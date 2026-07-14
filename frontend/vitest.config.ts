import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["lib/api.ts", "lib/result-adapter.ts"],
    },
  },
  resolve: {
    alias: {
      "@": rootDir,
    },
  },
});
