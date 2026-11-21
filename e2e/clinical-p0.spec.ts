/**
 * Phase 4.8.6 — Clinical E2E P0 executable specification.
 * PQ-01 — Hardened infrastructure (fixtures/helpers); same functional coverage.
 *
 * Sin mocks clínicos irreales: requiere staging/preview real + credenciales médico.
 * Se omite automáticamente si faltan variables de entorno (local).
 * En CI / E2E_STRICT faltan UUIDs → error explícito (no skip silencioso).
 */
import { test, expect, configureP0Suite } from "./fixtures/p0";
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

  test("RC18 Copilot no se superpone al camino Signature-Ready en desktop", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_HTA");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoConsultation(page, consultationId!);

    const rail = page.locator(
      '[data-testid="clinical-navigation-rail"][data-orientation="vertical"]:visible',
    );
    const copilot = page.getByTestId("heydoctor-copilot-workspace");
    await expect(rail).toBeVisible();
    await expect(copilot).toBeVisible({ timeout: 15_000 });

    const railBounds = await rail.boundingBox();
    const copilotBounds = await copilot.boundingBox();
    expect(railBounds).not.toBeNull();
    expect(copilotBounds).not.toBeNull();
    // The drawer must start after the rail column, regardless of z-index.
    expect(copilotBounds!.x).toBeGreaterThanOrEqual(
      railBounds!.x + railBounds!.width - 1,
    );
    expect(copilotBounds!.x + copilotBounds!.width).toBeLessThanOrEqual(
      1440 + 1,
    );
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
    await closeClinicalModuleSheet(page);

    // Firma en bloque de cierre (§20)
    await visibleEncounterSection(page, "encounter-section-20").scrollIntoViewIfNeeded();
    const signButton = page.getByRole("button", { name: /firmar consulta/i });
    if (await signButton.isVisible()) {
      await drawSignature(page);
      await page.getByRole("button", { name: /confirmar|firmar/i }).click();
    }

    await expect(page.getByTestId("encounter-signed-confirmation")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("encounter-signed-confirmation")).toHaveAttribute(
      "role",
      "status",
    );

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
    await expect(page.getByTestId("encounter-signed-confirmation")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("encounter-signed-confirmation")).toHaveAttribute(
      "role",
      "status",
    );
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

    // UC-01 abre el hub al hidratar el encounter. Contrato: afirmar, no click.
    const copilotHub = page.getByTestId("heydoctor-copilot-workspace");
    await expect(copilotHub).toBeVisible({ timeout: 15_000 });
    await expect(copilotHub.getByTestId("heydoctor-copilot-hero")).toBeVisible();

    await page.keyboard.press("Escape");

    await visibleEncounterSection(page, "encounter-section-20").scrollIntoViewIfNeeded();
    await drawSignature(page);
    await page.getByRole("button", { name: /firmar consulta/i }).click();
    await expect(page.getByTestId("encounter-signed-confirmation")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("encounter-signed-confirmation")).toHaveAttribute(
      "role",
      "status",
    );

    await page.getByTestId("clinical-action-bar").getByRole("button", {
      name: /documentos/i,
    }).click();
    await expect(page.getByTestId("clinical-module-sheet")).toBeVisible();
  });

  test("P0-4 Pago — firma → Stripe → webhook → lock", async ({ doctorPage: page }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_PAYMENT");
    expect(consultationId, "Requiere E2E_CONSULTATION_PAYMENT").toBeTruthy();

    // Fail closed before any checkout mutation. This opt-in is authorization,
    // NOT proof of Test Mode: the independent safety evidence below is mandatory.
    expect(
      process.env.E2E_STRIPE_TEST_PAYMENT_AUTHORIZED,
      "BLOCKED: authorize the isolated Stripe Test run only after completing docs/rc12-stripe-payment-contract.md",
    ).toBe("1");
    expect(new URL(page.url()).origin).toBe(
      "https://heydoctor-frontend-rc17-qa-qa-isolated.up.railway.app",
    );

    await gotoConsultation(page, consultationId!);

    // Debe estar signed antes de pagar (canPay ambiguo en completed — validar signed)
    await expect(page.getByTestId("encounter-signed-confirmation")).toBeVisible();
    await expect(page.getByTestId("encounter-signed-confirmation")).toHaveAttribute(
      "role",
      "status",
    );

    const payButton = page.getByTestId("encounter-pay-trigger");
    await expect(payButton).toBeVisible();
    await payButton.click();

    const confirmPay = page.getByTestId("encounter-payment-panel")
      .getByRole("button", { name: "Confirmar pago", exact: true });
    await expect(confirmPay).toBeVisible();
    const checkoutResponsePromise = page.waitForResponse((response) =>
      response.request().method() === "POST" &&
      /\/(payments|payku)\/create-payment-session$/.test(new URL(response.url()).pathname),
    );
    await confirmPay.click();
    const checkoutResponse = await checkoutResponsePromise;
    expect(new URL(checkoutResponse.url()).pathname).toBe(
      "/hd-api/payments/create-payment-session",
    );
    expect(checkoutResponse.ok(), "Canonical consultation checkout must succeed").toBe(true);
    const checkout = await checkoutResponse.json() as { paymentId: string; paymentUrl: string };
    expect(checkout.paymentId).toMatch(/^[0-9a-f-]{36}$/i);
    const checkoutUrl = new URL(checkout.paymentUrl);
    expect(checkoutUrl.protocol).toBe("https:");
    expect(checkoutUrl.hostname).toBe("checkout.stripe.com");
    expect(checkoutUrl.pathname).toMatch(/\/cs_test_/);

    // No mock, forged return parameter, API confirmation or auto-charge driver.
    // Complete hosted Checkout only in the separately authorized Test run.
    // An uncompleted checkout is a FAILURE, never a successful skipped scenario.
    const [paidResponse] = await Promise.all([
      page.waitForResponse((response) =>
        response.request().method() === "GET" &&
        new URL(response.url()).pathname ===
          `/hd-api/payments/consultation/${consultationId}/payment-status`,
        { timeout: 60_000 },
      ),
      page.waitForURL((url) =>
        url.origin === "https://heydoctor-frontend-rc17-qa-qa-isolated.up.railway.app" &&
        url.pathname === "/payments/return" && url.hash === `#${checkout.paymentId}`,
        { timeout: 60_000 },
      ),
    ]);
    expect(paidResponse.ok()).toBe(true);
    expect(await paidResponse.json()).toMatchObject({ isPaid: true, hasPending: false });

    // Reload the encounter through the real application; the redirect is not
    // the payment SSOT. Webhook delivery/replay evidence remains a release gate.
    await gotoConsultation(page, consultationId!);

    await expect(page.getByText(/bloqueada|locked|pagada/i)).toBeVisible({
      timeout: 30_000,
    });

    const treatment = page.locator("#soap-treatment");
    await expect(treatment).toBeVisible();
    await expect(treatment).toBeDisabled();
    await expect(payButton).toHaveCount(0);
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
