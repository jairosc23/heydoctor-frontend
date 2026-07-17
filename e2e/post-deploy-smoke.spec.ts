/**
 * F2-02 — Post-deploy UI smoke (Preview / Production tip).
 * Thin checks only — reuses PQ-01 / F2-01 helpers. Not a full reliability suite.
 */
import {
  test,
  expect,
  configureAgendaAuthSuite,
} from "./fixtures/agenda-auth";
import {
  assertAuthenticatedPanel,
  loginAsDoctor,
  logoutDoctor,
} from "./helpers/auth";
import {
  expectAgendaShellHealthy,
  gotoAgenda,
} from "./helpers/agenda";
import { isE2EAuthReady } from "./helpers/env";

test.describe("F2-02 — Post-deploy UI smoke", () => {
  configureAgendaAuthSuite();

  test("SMOKE-01 landing principal responde", async ({ page }) => {
    test.skip(!process.env.E2E_BASE_URL?.trim(), "Requiere E2E_BASE_URL");
    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.ok() || res?.status() === 304).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  });

  test("SMOKE-02 login + panel autenticado", async ({ page }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await assertAuthenticatedPanel(page);
  });

  test("SMOKE-03 agenda disponible (shell)", async ({ doctorPage: page }) => {
    await gotoAgenda(page);
    await expectAgendaShellHealthy(page);
  });

  test("SMOKE-04 logout limpia sesión", async ({ doctorPage: page }) => {
    await gotoAgenda(page);
    await logoutDoctor(page);
    await expect(page).toHaveURL(/\/login/);
  });
});
