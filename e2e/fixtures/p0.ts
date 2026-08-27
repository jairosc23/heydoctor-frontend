/**
 * PQ-01 — Playwright fixtures for Clinical P0.
 * Single doctor session per worker: the first `doctorPage` logs in; later
 * tests reuse that page. Re-login only if the URL is `/login` again.
 * AUTH-01 keeps using a cold `page` + `loginAsDoctor` (login path under test).
 */
import { test as base, expect, type BrowserContext, type Page } from "@playwright/test";
import { loginAsDoctor } from "../helpers/auth";
import { isE2EAuthReady } from "../helpers/env";
import { attachVercelPreviewBypass } from "../helpers/vercel-preview-bypass";

type P0Fixtures = {
  /** Authenticated doctor page (one session per worker). */
  doctorPage: Page;
};

const workerSession: {
  context: BrowserContext | null;
  page: Page | null;
} = {
  context: null,
  page: null,
};

function contextOptions(): {
  locale: string;
  timezoneId: string;
  viewport: { width: number; height: number };
} {
  return {
    locale: "es-VE",
    timezoneId: "America/Caracas",
    viewport: { width: 1440, height: 900 },
  };
}

export const test = base.extend<P0Fixtures>({
  context: async ({ context }, use) => {
    await attachVercelPreviewBypass(context);
    await use(context);
  },

  doctorPage: async ({ browser }, use) => {
    test.skip(
      !isE2EAuthReady(),
      "Requiere E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD",
    );

    if (!workerSession.page || workerSession.page.isClosed()) {
      workerSession.context = await browser.newContext(contextOptions());
      await attachVercelPreviewBypass(workerSession.context);
      workerSession.page = await workerSession.context.newPage();
      await loginAsDoctor(workerSession.page);
    } else if (workerSession.page.url().includes("/login")) {
      await loginAsDoctor(workerSession.page);
    }

    await use(workerSession.page);
  },
});

export { expect };

/** Apply serial execution + auth fixture wiring inside a describe block. */
export function configureP0Suite(): void {
  test.describe.configure({ mode: "serial" });
}
