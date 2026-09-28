import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",

    environmentOptions: {
      jsdom: {
        url: "http://localhost:5173",
      },
    },

    setupFiles: "./src/tests/setup.ts",

    clearMocks: true,
    restoreMocks: true,
  },
});