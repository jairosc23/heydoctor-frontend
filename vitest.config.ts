import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * PQ-02 — Component testing (Vitest + Testing Library).
 * PQ-03 — Coverage governance for UI primitives (report_only soft floors).
 * Does not replace `npm test` (node:test on lib unit tests).
 */
export default defineConfig({
  plugins: [react()],
  test: {
    name: "component",
    environment: "jsdom",
    globals: false,
    setupFiles: ["./test/setup.ts"],
    include: ["test/components/**/*.test.tsx"],
    exclude: ["node_modules", ".next", "e2e", "lib/**"],
    css: false,
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage/component",
      reporter: ["text-summary", "lcov", "json-summary", "cobertura"],
      include: ["components/ui/**/*.{ts,tsx}"],
      exclude: [
        "**/node_modules/**",
        "**/*.test.*",
        "**/test/**",
        "**/*.d.ts",
      ],
      // No hard thresholds (PQ-03). Soft floors via coverage-governance.mjs.
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
