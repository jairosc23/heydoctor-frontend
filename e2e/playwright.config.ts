import { defineConfig, devices } from "@playwright/test";

/**
 * Phase 4.8.6 — Playwright config para casos P0 clínicos.
 *
 * Requiere:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *
 * Variables (.env.e2e o CI):
 *   E2E_BASE_URL          — ej. https://staging.heydoctor.health
 *   E2E_DOCTOR_EMAIL
 *   E2E_DOCTOR_PASSWORD
 *   E2E_CONSULTATION_HTA    — UUID consulta HTA seed (opcional)
 *   E2E_CONSULTATION_DM2    — UUID consulta DM2 seed (opcional)
 *   E2E_CONSULTATION_ACUTE  — UUID consulta aguda seed (opcional)
 *   E2E_CONSULTATION_PAYMENT — UUID consulta signed para pago (opcional)
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
      name: "chromium-desktop-official-ws",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-mobile-official-ws",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],
});
