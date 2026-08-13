/**
 * Capturas visuales del Clinical Encounter™.
 * Ejecutar con preview staging + credenciales:
 *   cp e2e/.env.e2e.example .env.e2e  # completar vars
 *   set -a && source .env.e2e && set +a
 *   npx playwright test e2e/visual-encounter-audit.spec.ts --config e2e/playwright.config.ts
 */
import { test, expect } from "@playwright/test";
import path from "node:path";

const E2E_READY =
  Boolean(process.env.E2E_BASE_URL) &&
  Boolean(process.env.E2E_DOCTOR_EMAIL) &&
  Boolean(process.env.E2E_DOCTOR_PASSWORD);

const CONSULTATION_ID =
  process.env.E2E_CONSULTATION_HTA || process.env.E2E_CONSULTATION_DM2;

const OUT_DIR = path.join(process.cwd(), "visual-audit", "hito5", "live");

test.describe("Visual audit — Clinical Encounter Hito 5", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!E2E_READY || !CONSULTATION_ID, "Requiere .env.e2e completo");

    await page.goto("/login");
    await page.getByLabel(/correo|email/i).fill(process.env.E2E_DOCTOR_EMAIL!);
    await page.getByLabel(/contraseña|password/i).fill(
      process.env.E2E_DOCTOR_PASSWORD!,
    );
    await page.getByRole("button", { name: /iniciar|entrar|login/i }).click();
    await expect(page).not.toHaveURL(/\/login/);
    await page.goto(`/panel/consultas/${CONSULTATION_ID}`);
    await expect(page.getByTestId("clinical-encounter-chart")).toBeVisible({
      timeout: 30_000,
    });
  });

  for (const [name, width, height] of [
    ["desktop", 1440, 900],
    ["tablet", 834, 1194],
    ["mobile", 390, 844],
  ] as const) {
    test(`captura ${name} — inicio consulta`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.screenshot({
        path: path.join(OUT_DIR, `${name}-01-inicio.png`),
        fullPage: false,
      });
    });
  }

  const sections = [
    { id: "encounter-section-1", file: "identificacion" },
    { id: "encounter-section-3", file: "anamnesis" },
    { id: "encounter-section-9", file: "vitales" },
    { id: "encounter-section-10", file: "examen-fisico" },
    { id: "encounter-section-11", file: "diagnostico" },
    { id: "encounter-section-13", file: "tratamiento" },
    { id: "encounter-section-21", file: "clinical-documents" },
    { id: "encounter-section-20", file: "firma" },
    { id: "encounter-section-22", file: "documentos" },
  ];

  for (const { id, file } of sections) {
    test(`scroll — ${file}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const el = page.locator(`#${id}`);
      if (await el.count()) {
        await el.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: path.join(OUT_DIR, `desktop-scroll-${file}.png`),
          fullPage: false,
        });
      }
    });
  }
});
