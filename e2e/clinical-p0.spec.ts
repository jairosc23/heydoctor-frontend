/**
 * Phase 4.8.6 — Clinical E2E P0 executable specification.
 *
 * Sin mocks clínicos irreales: requiere staging real + credenciales médico.
 * Se omite automáticamente si faltan variables de entorno.
 */
import { test, expect } from "@playwright/test";

const E2E_READY =
  Boolean(process.env.E2E_BASE_URL) &&
  Boolean(process.env.E2E_DOCTOR_EMAIL) &&
  Boolean(process.env.E2E_DOCTOR_PASSWORD);

test.describe("Clinical P0 — workspace oficial (Action WS + Smart WS ON)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!E2E_READY, "Requiere E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD");

    await page.goto("/login");
    await page.getByLabel(/correo|email/i).fill(process.env.E2E_DOCTOR_EMAIL!);
    await page.getByLabel(/contraseña|password/i).fill(
      process.env.E2E_DOCTOR_PASSWORD!,
    );
    await page.getByRole("button", { name: /iniciar|entrar|login/i }).click();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test("P0-1 HTA seguimiento — Memory → SOAP → Receta → Firma → PDF", async ({
    page,
  }) => {
    const consultationId = process.env.E2E_CONSULTATION_HTA;
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    await page.goto(`/panel/consultas/${consultationId}`);

    // Layout oficial 2-col
    await expect(
      page.locator('[data-testid="encounter-split-layout"]'),
    ).toHaveAttribute("data-clinical-action-workspace", "true");
    await expect(
      page.locator('[data-testid="encounter-split-layout"]'),
    ).toHaveAttribute("data-columns", "2");

    // Clinical Memory en rail
    await expect(
      page.getByRole("complementary", { name: /contexto del paciente/i }),
    ).toBeVisible();

    // Ficha clínica integral + autosave
    await expect(page.getByTestId("clinical-encounter-chart")).toBeVisible();
    const notesArea = page.getByTestId("encounter-treatment");
    if (await notesArea.isVisible()) {
      await notesArea.fill("Control HTA — PA 145/92 mmHg. Continuar losartán 50mg.");
    }
    await expect(page.getByText(/guardado|saved/i)).toBeVisible({
      timeout: 20_000,
    });

    // Receta vía Action Bar
    await page.getByTestId("clinical-action-bar").getByRole("button", {
      name: /recetas/i,
    }).click();
    await expect(page.getByTestId("clinical-module-sheet")).toBeVisible();

    // Firma en bloque de cierre (§20)
    await page.getByTestId("encounter-section-20").scrollIntoViewIfNeeded();
    const signButton = page.getByRole("button", { name: /firmar consulta/i });
    if (await signButton.isVisible()) {
      await signButton.click();
      // SignatureCanvas — trazo mínimo si canvas presente
      const canvas = page.locator("canvas").first();
      if (await canvas.isVisible()) {
        const box = await canvas.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 10, box.y + 10);
          await page.mouse.down();
          await page.mouse.move(box.x + 80, box.y + 40);
          await page.mouse.up();
        }
        await page.getByRole("button", { name: /confirmar|firmar/i }).click();
      }
    }

    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });

    // Bloque de cierre médico legal visible
    await expect(page.getByTestId("encounter-closure-section")).toBeVisible();
    await expect(page.getByTestId("encounter-section-22")).toBeVisible();
  });

  test("P0-2 DM2 — Lab order → plan → firma", async ({ page }) => {
    const consultationId = process.env.E2E_CONSULTATION_DM2;
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_DM2");

    await page.goto(`/panel/consultas/${consultationId}`);

    await page.getByTestId("clinical-action-bar").getByRole("button", {
      name: /laboratorio|lab/i,
    }).click();
    await expect(page.getByTestId("clinical-module-sheet")).toBeVisible();
    await expect(page.getByTestId("clinical-module-sheet-content")).toHaveAttribute(
      "data-module",
      /lab/,
    );

    // Crear orden — selector depende de UI LabOrdersPanel
    const createLab = page.getByRole("button", { name: /crear|orden|solicitar/i }).first();
    if (await createLab.isVisible()) {
      await createLab.click();
    }

    await page.getByTestId("encounter-section-20").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /firmar consulta/i }).click();
    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("P0-3 Consulta aguda — SOAP → documento → cierre", async ({ page }) => {
    const consultationId = process.env.E2E_CONSULTATION_ACUTE;
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_ACUTE");

    await page.goto(`/panel/consultas/${consultationId}`);

    await expect(page.locator('[data-smart-workspace="true"]')).toBeVisible();

    const treatment = page.locator("#soap-treatment");
    await treatment.fill("Analgésico PRN. Reposo. Control si persiste >48h.");
    await expect(page.getByText(/guardado|saved/i)).toBeVisible({
      timeout: 20_000,
    });

    // Copilot hub accesible
    await page.getByRole("button", { name: /copilot|análisis clínico/i }).click();
    await expect(page.getByText(/Clinical Copilot/i)).toBeVisible();

    await page.keyboard.press("Escape");

    await page.getByTestId("encounter-section-20").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /firmar consulta/i }).click();
    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("clinical-action-bar").getByRole("button", {
      name: /documentos/i,
    }).click();
    await expect(page.getByTestId("clinical-module-sheet")).toBeVisible();
  });

  test("P0-4 Pago — firma → Payku → lock", async ({ page }) => {
    const consultationId = process.env.E2E_CONSULTATION_PAYMENT;
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_PAYMENT");

    await page.goto(`/panel/consultas/${consultationId}`);

    // Debe estar signed antes de pagar (canPay ambiguo en completed — validar signed)
    await expect(page.getByText(/firmada|signed/i)).toBeVisible();

    const payButton = page.getByRole("button", { name: /pagar|pago/i });
    await expect(payButton).toBeVisible();
    await payButton.click();

    // Confirmación inline
    const confirmPay = page.getByRole("button", { name: /confirmar|continuar/i });
    if (await confirmPay.isVisible()) {
      await confirmPay.click();
    }

    // Payku redirect — en sandbox completar manualmente o usar mock en dev
    await page.waitForURL(/payku|payment|consultas/, { timeout: 60_000 });

    // Retorno success
    if (!page.url().includes("payment=success")) {
      test.skip(true, "Completar pago Payku sandbox manualmente en CI");
    }

    await expect(page.getByText(/bloqueada|locked|pagada/i)).toBeVisible({
      timeout: 30_000,
    });

    const treatment = page.locator("#soap-treatment");
    if (await treatment.isVisible()) {
      await expect(treatment).toBeDisabled();
    }
  });
});

test.describe("Clinical P0 — smoke layout flags", () => {
  test("encounter grid expone data attributes workspace", async ({ page }) => {
    test.skip(!E2E_READY, "Requiere credenciales E2E");
    test.skip(!process.env.E2E_CONSULTATION_HTA, "Requiere E2E_CONSULTATION_HTA");

    await page.goto("/login");
    await page.getByLabel(/correo|email/i).fill(process.env.E2E_DOCTOR_EMAIL!);
    await page.getByLabel(/contraseña|password/i).fill(
      process.env.E2E_DOCTOR_PASSWORD!,
    );
    await page.getByRole("button", { name: /iniciar|entrar|login/i }).click();

    await page.goto(`/panel/consultas/${process.env.E2E_CONSULTATION_HTA}`);

    const layout = page.locator('[data-testid="encounter-split-layout"]');
    await expect(layout).toBeVisible();

    const actionWs = await layout.getAttribute("data-clinical-action-workspace");
    const columns = await layout.getAttribute("data-columns");

    // Documentar combinación real del entorno
    console.log(`[E2E] Action WS=${actionWs} columns=${columns}`);
    expect(["true", null]).toContain(actionWs);
    expect(["2", "3"]).toContain(columns);
  });
});
