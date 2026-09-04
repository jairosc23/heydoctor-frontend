import { defineConfig, devices } from "@playwright/test";

/**
 * Auditoría visual PR2 — desktop, tablet y mobile.
 * No requiere credenciales. Arranca Next en :3010 si no hay servidor.
 */
export default defineConfig({
  testDir: ".",
  testMatch: /pr2-enterprise-ux-audit\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  outputDir: "../test-results/pr2-ux",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "../playwright-report/pr2-ux" }],
  ],
  use: {
    baseURL: process.env.PR2_UX_BASE_URL ?? "http://127.0.0.1:3010",
    locale: "es-VE",
    timezoneId: "America/Caracas",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npx next start -p 3010 --hostname 127.0.0.1",
    cwd: "..",
    url: "http://127.0.0.1:3010",
    reuseExistingServer: false,
    timeout: 180_000,
  },
  projects: [
    {
      name: "pr2-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "pr2-tablet",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: "pr2-mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
