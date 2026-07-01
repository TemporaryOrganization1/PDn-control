import { defineConfig } from "vitest/config";

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
      "@": new URL(".", import.meta.url).pathname,
    },
  },
});
