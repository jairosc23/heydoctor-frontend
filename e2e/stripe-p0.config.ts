import { defineConfig, devices } from "@playwright/test";

// Dedicated opt-in gate; never runs other certified P0 scenarios or retries a payment.
export default defineConfig({
  testDir: ".", testMatch: /clinical-p0\.spec\.ts/, grep: /P0-4 Pago/,
  globalSetup: "./stripe-p0.setup.ts",
  workers: 1, retries: 0, timeout: 480_000, forbidOnly: true,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["junit", { outputFile: "../test-results/rc12-stripe.xml" }]],
  use: { ...devices["Desktop Chrome"], baseURL: process.env.E2E_BASE_URL,
    actionTimeout: 15_000, navigationTimeout: 30_000,
    trace: "off", screenshot: "off", video: "off", ignoreHTTPSErrors: false },
});
