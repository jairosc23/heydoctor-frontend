/**
 * PQ-01 — Playwright fixtures for Clinical P0.
 * Extends base test; keeps skip-without-secrets semantics.
 */
import { test as base, expect } from "@playwright/test";
import { loginAsDoctor } from "../helpers/auth";
import { isE2EAuthReady } from "../helpers/env";

type P0Fixtures = {
  /** Page with a fresh doctor session (cookies cleared + login). */
  doctorPage: import("@playwright/test").Page;
};

export const test = base.extend<P0Fixtures>({
  doctorPage: async ({ page }, use) => {
    test.skip(
      !isE2EAuthReady(),
      "Requiere E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD",
    );
    await loginAsDoctor(page);
    await use(page);
  },
});

export { expect };

/** Apply serial execution + auth fixture wiring inside a describe block. */
export function configureP0Suite(): void {
  test.describe.configure({ mode: "serial" });
}
