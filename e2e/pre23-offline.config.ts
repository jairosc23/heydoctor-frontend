import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  testMatch: "pre23-auth-navigation.offline.spec.ts",
  timeout: 10_000,
  retries: 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    browserName: "chromium", headless: true, trace: "off", video: "off", screenshot: "off",
    launchOptions: process.env.PRE23_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PRE23_CHROMIUM_EXECUTABLE }
      : {},
  },
});
