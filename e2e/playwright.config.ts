import { defineConfig, devices } from "@playwright/test";

/**
 * Phase 19.2 — Playwright config alineado a ADR-019.
 *
 * P0 clínicos: solo desktop 1440×900 (encounter-split-layout es xl:block).
 * Visual audit: proyecto desktop separado.
 *
 * Variables (.env.e2e o CI):
 *   E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD
 *   E2E_CONSULTATION_HTA | DM2 | ACUTE | PAYMENT
 *
 * Build target debe tener:
 *   NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1
 *   NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1
 */
export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 120_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop-clinical-p0",
      testMatch: /clinical-p0\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-desktop-visual-audit",
      testMatch: /visual-encounter-audit\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
