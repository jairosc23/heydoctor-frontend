import { expect, type Page } from "@playwright/test";
import { baseURL } from "./env";

const LOGIN_PATH = "/login";
const PANEL_HOME = "/panel/consultas";

function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const origin = baseURL().replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${p}`;
}

/**
 * Deterministic doctor login for P0 / F2-01.
 * Clears prior cookies for isolation, waits for form, asserts leave /login.
 */
export async function loginAsDoctor(page: Page): Promise<void> {
  const email = process.env.E2E_DOCTOR_EMAIL?.trim();
  const password = process.env.E2E_DOCTOR_PASSWORD?.trim();
  const base = process.env.E2E_BASE_URL?.trim();
  if (!base || !email || !password) {
    throw new Error(
      "[F2-01] Missing process.env.E2E_BASE_URL, E2E_DOCTOR_EMAIL and/or E2E_DOCTOR_PASSWORD. Refusing to substitute placeholder credentials.",
    );
  }
  if (
    /^(debug@example\.com|doctor@example\.com)$/i.test(email) ||
    /^(debug-placeholder|replace-me)$/i.test(password)
  ) {
    throw new Error(
      `[F2-01] Placeholder E2E credentials rejected (${email}). Set process.env.E2E_DOCTOR_EMAIL / E2E_DOCTOR_PASSWORD.`,
    );
  }

  await page.context().clearCookies();

  await page.goto(absoluteUrl(LOGIN_PATH), { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/);

  const emailField = page.getByLabel(/correo|email/i);
  const passwordField = page.getByLabel(/contraseña|password/i);
  const submit = page.getByRole("button", {
    name: /ingresar|iniciar\s+sesi[oó]n|iniciar|entrar|login/i,
  });

  await expect(emailField).toBeVisible({ timeout: 30_000 });
  await expect(passwordField).toBeVisible();
  await expect(submit).toBeEnabled();

  await emailField.fill(email);
  await passwordField.fill(password);

  await Promise.all([
    page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 45_000,
    }),
    submit.click(),
  ]);

  await expect(page).not.toHaveURL(/\/login/);
}

/** Re-auth helper when a test detects session loss mid-flow. */
export async function ensureDoctorSession(page: Page): Promise<void> {
  if (page.url().includes("/login")) {
    await loginAsDoctor(page);
  }
}

/** F2-01 — Logout via panel chrome (no parallel auth infra). */
export async function logoutDoctor(page: Page): Promise<void> {
  const logoutBtn = page.getByRole("button", { name: /cerrar sesión/i });
  await expect(logoutBtn).toBeVisible({ timeout: 30_000 });
  await Promise.all([
    page.waitForURL(/\/login/, { timeout: 45_000 }),
    logoutBtn.click(),
  ]);
  await expect(page).toHaveURL(/\/login/);
}

/** Staff home is `/dashboard` (`app/panel` redirects there); `/panel/*` remains valid. */
const AUTHENTICATED_STAFF_PATH = /\/(panel|dashboard)(\/|$)/;

/** Assert doctor is inside an authenticated staff route. */
export async function assertAuthenticatedPanel(page: Page): Promise<void> {
  await expect(page).toHaveURL(AUTHENTICATED_STAFF_PATH);
  await expect(page).not.toHaveURL(/\/login/);
}

/**
 * F2-01 — Unauthenticated access to a protected route must land on login
 * (or bounce through login). Clears cookies first.
 */
export async function expectProtectedRouteRequiresLogin(
  page: Page,
  path: string,
): Promise<void> {
  await page.context().clearCookies();
  testSkipWithoutBase(path);
  await page.goto(absoluteUrl(path), { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/, { timeout: 45_000 });
}

function testSkipWithoutBase(path: string): void {
  // When E2E_BASE_URL is unset, relative navigation is invalid — soft-skip at caller.
  void path;
}

/**
 * F2-01 — Session loss: wipe cookies while on panel → reload → login.
 * Models expired/cleared session recovery entry point.
 */
export async function expectSessionLossRedirectsToLogin(
  page: Page,
): Promise<void> {
  await assertAuthenticatedPanel(page);
  await page.context().clearCookies();
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/\/login/, { timeout: 45_000 });
}

/** Soft navigation helper after login (Preview-friendly waits). */
export async function gotoAuthenticatedPath(
  page: Page,
  path: string,
): Promise<void> {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page).not.toHaveURL(/\/login/, { timeout: 45_000 });
  await expect
    .poll(() => new URL(page.url()).pathname, { timeout: 45_000 })
    .toBe(path);
}

export { PANEL_HOME, LOGIN_PATH };
