import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./_test_/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "styled-jsx": path.resolve(__dirname, "../../node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.28.3_react@19.1.0/node_modules/styled-jsx"),
      "styled-jsx/style": path.resolve(__dirname, "../../node_modules/.pnpm/styled-jsx@5.1.6_@babel+core@7.28.3_react@19.1.0/node_modules/styled-jsx/style.js"),
    },
  },
  define: {
    __STYLED_JSX__: true,
  },
});
