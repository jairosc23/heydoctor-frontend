import { defineConfig, devices } from "@playwright/test";

/**
 * Phase 19.2 / PQ-01 — Playwright config (ADR-019 + P0 hardening).
 *
 * P0 clínicos: solo desktop 1440×900 (encounter-split-layout es xl:block).
 * Visual / Copilot projects: unchanged; not part of CI P0 gate.
 *
 * Variables (.env.e2e o CI):
 *   E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD
 *   E2E_CONSULTATION_HTA | DM2 | ACUTE | PAYMENT
 *   E2E_STRICT=1 — fail hard on missing consultation UUIDs (CI sets implicitly via CI=true)
 *
 * Build target debe tener:
 *   NEXT_PUBLIC_CLINICAL_ACTION_WORKSPACE=1
 *   NEXT_PUBLIC_SMART_CLINICAL_WORKSPACE=1
 */

const isCI = !!process.env.CI;
const vercelBypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

export default defineConfig({
  testDir: ".",
  fullyParallel: false,
  forbidOnly: isCI,
  /* CI: 2 retries absorb Preview cold-start / transient network without hiding systemic fails */
  retries: isCI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  outputDir: "../test-results",
  reporter: isCI
    ? [
        ["list"],
        ["html", { open: "never", outputFolder: "../playwright-report" }],
        ["junit", { outputFile: "../test-results/junit-e2e.xml" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "../playwright-report" }],
      ],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    ...(vercelBypass
      ? {
          extraHTTPHeaders: {
            "x-vercel-protection-bypass": vercelBypass,
            "x-vercel-set-bypass-cookie": "true",
          },
        }
      : {}),
    actionTimeout: 20_000,
    navigationTimeout: 60_000,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    ignoreHTTPSErrors: false,
    locale: "es-VE",
    timezoneId: "America/Caracas",
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
      /* F2-01 — Auth + Agenda Enterprise reliability (auth triad only) */
      name: "chromium-desktop-agenda-auth",
      testMatch: /agenda-auth-reliability\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      /* F2-02 — Post-deploy UI smoke (Preview/Production tip) */
      name: "chromium-desktop-post-deploy-smoke",
      testMatch: /post-deploy-smoke\.spec\.ts/,
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
    {
      name: "chromium-desktop-medical-copilot-rc2",
      testMatch: /medical-copilot-rc2\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-desktop-ga-fix-deeplink",
      testMatch: /ga-fix-deeplink\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "chromium-desktop-ar2-foundation",
      testMatch: /ar2-foundation\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
