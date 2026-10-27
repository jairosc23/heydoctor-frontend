import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: /p2f-patient-invite\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:3000",
    locale: "es-CL",
    timezoneId: "America/Santiago",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3000",
    url: "http://127.0.0.1:3000/portal/register?bookingToken=qa-ready",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
