import { expect, type Page } from "@playwright/test";

/** First visible encounter section by data-testid (desktop split layout). */
export function visibleEncounterSection(page: Page, id: string) {
  return page.locator(`[data-testid="${id}"]:visible`).first();
}

/**
 * Navigate to consultation with stable readiness signal.
 * Prefers encounter chrome / split layout over networkidle (Preview-friendly).
 */
export async function gotoConsultation(
  page: Page,
  consultationId: string,
): Promise<void> {
  await page.goto(`/panel/consultas/${consultationId}`, {
    waitUntil: "domcontentloaded",
  });

  // Session loss → surface clearly for retries
  if (page.url().includes("/login")) {
    throw new Error(
      `[PQ-01] Redirected to /login while opening consultation ${consultationId}`,
    );
  }

  const chrome = page.getByTestId("encounter-chrome-shell");
  const layout = page.locator('[data-testid="encounter-split-layout"]');

  await expect(chrome.or(layout).first()).toBeVisible({ timeout: 60_000 });
}

/** Trazo manuscrito mínimo en SignatureCanvas (`hasContent`). No confirma ni firma. */
export async function drawSignature(page: Page): Promise<void> {
  const canvas = page.locator("canvas").first();
  if (await canvas.isVisible()) {
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 80, box.y + 40);
      await page.mouse.up();
    }
  }
}
