/**
 * Phase 4.8.6 — Clinical E2E P0 executable specification.
 * PQ-01 — Hardened infrastructure (fixtures/helpers); same functional coverage.
 *
 * Sin mocks clínicos irreales: requiere staging/preview real + credenciales médico.
 * Se omite automáticamente si faltan variables de entorno (local).
 * En CI / E2E_STRICT faltan UUIDs → error explícito (no skip silencioso).
 */
import { test, expect, configureP0Suite } from "./fixtures/p0";
import { HEYDOCTOR_COPILOT_BRAND } from "../lib/brand/heydoctor-copilot";
import { CLINICAL_OVERLAY_Z } from "../lib/clinical-overlay-contract";
import { getConsultationId } from "./helpers/env";
import {
  closeClinicalModuleSheet,
  drawSignature,
  gotoConsultation,
  visibleEncounterSection,
} from "./helpers/encounter";

test.describe("Clinical P0 — workspace oficial (Action WS + Smart WS ON)", () => {
  configureP0Suite();

  test("P0-0 Patient Context Bar — sticky persistente en scroll profundo", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_HTA");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    await gotoConsultation(page, consultationId!);

    const scrollContainer = page.locator("main").first();
    const chrome = page.getByTestId("encounter-chrome-shell");
    const header = page.getByTestId("sticky-patient-header");

    await expect(scrollContainer).toBeVisible();
    await expect(chrome).toBeVisible();
    await expect(header).toBeVisible();
    await expect(header.getByTestId("context-bar-identity-row")).toBeVisible();
    await expect(header.getByTestId("context-bar-risk-row")).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      await expect(header.getByTestId("context-bar-continuity-row")).toBeVisible();
    }
    await expect(
      header.getByText(/Borrador|En consulta|Firmado|Bloqueado|Cancelado/),
    ).toBeVisible();

    await expect(chrome).toHaveCSS("position", "sticky");
    await expect(chrome).toHaveCSS("top", "0px");
    await expect(chrome).toHaveCSS(
      "z-index",
      String(CLINICAL_OVERLAY_Z.chrome),
    );

    const navigationRail = page
      .locator('[data-testid="clinical-navigation-rail"]:visible')
      .first();
    await expect(navigationRail).toBeVisible();
    await expect(navigationRail).toHaveAttribute(
      "aria-label",
      "Navegación de ficha clínica",
    );
    const navigationProgress = navigationRail
      .locator('[data-testid="clinical-navigation-progress"]')
      .first();
    await expect(navigationProgress).toBeVisible();
    await expect(navigationProgress).toHaveAttribute("data-progress", /\d+/);
    await expect(navigationProgress).toHaveAttribute(
      "data-signature-ready",
      /true|false/,
    );

    const diagnosisNavItem = page
      .locator('[data-testid="clinical-navigation-item-11"]:visible')
      .first();
    await expect(diagnosisNavItem).toHaveAttribute(
      "data-completion",
      /empty|in_progress|completed|warning|blocked/,
    );

    const treatmentNavItem = page
      .locator('[data-testid="clinical-navigation-item-13"]:visible')
      .first();
    await expect(treatmentNavItem).toHaveAttribute(
      "data-completion",
      /empty|in_progress|completed|warning|blocked/,
    );
    await treatmentNavItem.click();
    await expect(visibleEncounterSection(page, "encounter-section-13")).toBeVisible();
    await expect(treatmentNavItem).toHaveAttribute("aria-current", "location");

    await scrollContainer.evaluate((element) => {
      element.scrollTop = 0;
      element.dispatchEvent(new Event("scroll", { bubbles: true }));
    });
    await expect(header).toHaveAttribute("data-compact", "false");

    await visibleEncounterSection(page, "encounter-section-13").scrollIntoViewIfNeeded();
    await scrollContainer.evaluate((element) => {
      element.scrollTop = Math.min(
        element.scrollHeight - element.clientHeight,
        element.scrollTop + 900,
      );
      element.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    await expect(header).toBeVisible();
    await expect(header).toHaveAttribute("data-compact", "true");

    const headerOwnsTopLayer = await page.evaluate(() => {
      const stickyHeader = document.querySelector(
        '[data-testid="sticky-patient-header"]',
      );
      const chromeShell = document.querySelector(
        '[data-testid="encounter-chrome-shell"]',
      );
      if (!(stickyHeader instanceof HTMLElement)) return false;
      if (!(chromeShell instanceof HTMLElement)) return false;

      const rect = stickyHeader.getBoundingClientRect();
      const probe = document.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + Math.min(rect.height / 2, 12),
      );

      return Boolean(
        probe &&
          (stickyHeader.contains(probe) || chromeShell.contains(probe)),
      );
    });

    expect(headerOwnsTopLayer).toBe(true);
  });

  test("P0-1 HTA seguimiento — Memory → SOAP → Receta → Firma → PDF", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_HTA");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    await gotoConsultation(page, consultationId!);

    // Layout oficial: contexto horizontal + ficha clínica prioritaria
    await expect(
      page.locator('[data-testid="encounter-split-layout"]'),
    ).toHaveAttribute("data-clinical-action-workspace", "true");
    await expect(
      page.locator('[data-testid="encounter-split-layout"]'),
    ).toHaveAttribute("data-columns", "1");

    // Clinical Memory/Timeline fuera de columna lateral fija
    await expect(page.getByTestId("clinical-context-panels")).toBeVisible();

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
    await visibleEncounterSection(page, "encounter-section-20").scrollIntoViewIfNeeded();
    const signButton = page.getByRole("button", { name: /firmar consulta/i });
    if (await signButton.isVisible()) {
      await drawSignature(page);
      await page.getByRole("button", { name: /confirmar|firmar/i }).click();
    }

    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });

    // Bloque de cierre médico legal visible
    await expect(page.getByTestId("encounter-closure-section")).toBeVisible();
    await expect(visibleEncounterSection(page, "encounter-section-22")).toBeVisible();
  });

  test("P0-2 DM2 — Lab order → plan → firma", async ({ doctorPage: page }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_DM2");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_DM2");

    await gotoConsultation(page, consultationId!);

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

    await closeClinicalModuleSheet(page);
    await visibleEncounterSection(page, "encounter-section-20").scrollIntoViewIfNeeded();
    await drawSignature(page);
    await page.getByRole("button", { name: /firmar consulta/i }).click();
    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("P0-3 Consulta aguda — SOAP → documento → cierre", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_ACUTE");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_ACUTE");

    await gotoConsultation(page, consultationId!);

    await expect(page.locator('[data-smart-workspace="true"]')).toBeVisible();

    const treatment = page.locator("#soap-treatment");
    await treatment.fill("Analgésico PRN. Reposo. Control si persiste >48h.");
    await expect(page.getByText(/guardado|saved/i)).toBeVisible({
      timeout: 20_000,
    });

    // Copilot hub accesible
    await page.getByRole("button", { name: /copilot|análisis clínico/i }).click();
    await expect(
      page.getByText(HEYDOCTOR_COPILOT_BRAND.productName),
    ).toBeVisible();

    await page.keyboard.press("Escape");

    await visibleEncounterSection(page, "encounter-section-20").scrollIntoViewIfNeeded();
    await page.getByRole("button", { name: /firmar consulta/i }).click();
    await expect(page.getByText(/firmada|signed/i)).toBeVisible({
      timeout: 30_000,
    });

    await page.getByTestId("clinical-action-bar").getByRole("button", {
      name: /documentos/i,
    }).click();
    await expect(page.getByTestId("clinical-module-sheet")).toBeVisible();
  });

  test("P0-4 Pago — firma → Payku → lock", async ({ doctorPage: page }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_PAYMENT");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_PAYMENT");

    await gotoConsultation(page, consultationId!);

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

    // Retorno success — limitación documentada PQ-01 (sandbox manual)
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

test.describe("Clinical P0 — ADR-019 observability smoke", () => {
  configureP0Suite();

  test("encounter grid expone contrato workspace oficial", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_HTA");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    await gotoConsultation(page, consultationId!);

    const layout = page.locator('[data-testid="encounter-split-layout"]');
    await expect(layout).toBeVisible();

    await expect(layout).toHaveAttribute("data-clinical-action-workspace", "true");
    await expect(layout).toHaveAttribute("data-columns", "1");
    await expect(page.locator('[data-smart-workspace="true"]')).toBeVisible();
  });
});
