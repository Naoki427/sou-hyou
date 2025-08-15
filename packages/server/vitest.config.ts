import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "threads",
    poolOptions: { threads: { maxThreads: 1, minThreads: 1 } },
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
