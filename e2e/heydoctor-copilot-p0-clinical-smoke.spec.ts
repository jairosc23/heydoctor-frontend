/**
 * P0 Clinical smoke — Clinical Operating System foundation.
 * Skips without E2E credentials. CI without secrets = controlled skip.
 *
 * Flow: Encounter → Workspace → Insights → Voice → Continuity → Signature
 *       → Review & Sign → Close → Reopen
 */
import { expect, type Request } from "@playwright/test";
import { test, configureP0Suite } from "./fixtures/p0";
import { getConsultationId } from "./helpers/env";
import { gotoConsultation } from "./helpers/encounter";

test.describe("P0 HeyDoctor Copilot Clinical OS smoke", () => {
  configureP0Suite();

  test("lazy bootstrap + workspace capabilities + session reuse", async ({
    doctorPage: page,
  }) => {
    const consultationId = getConsultationId("E2E_CONSULTATION_HTA");
    test.skip(!consultationId, "Requiere E2E_CONSULTATION_HTA");

    const mcSessionOrWorkspace: string[] = [];
    page.on("request", (req: Request) => {
      const url = req.url();
      if (
        url.includes("/medical-copilot/session") ||
        url.includes("/medical-copilot/workspace")
      ) {
        mcSessionOrWorkspace.push(`${req.method()} ${url}`);
      }
    });

    await gotoConsultation(page, consultationId!);
    await expect(page.getByTestId("encounter-chrome-shell")).toBeVisible({
      timeout: 30_000,
    });
    await page.waitForTimeout(900);
    expect(
      mcSessionOrWorkspace.length,
      "Lazy bootstrap: zero MC session/workspace before Workspace open",
    ).toBe(0);

    await page
      .getByRole("button", { name: /Abrir HeyDoctor Copilot|Copilot/i })
      .first()
      .click();
    const workspace = page.getByTestId("heydoctor-copilot-workspace");
    await expect(workspace).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("heydoctor-copilot-insights-home")).toBeVisible();
    await expect(page.getByTestId("heydoctor-copilot-runtime-strip")).toBeVisible();
    await expect(page.getByTestId("heydoctor-copilot-encounter-memory")).toBeVisible();

    await page.waitForTimeout(1500);
    const afterFirstOpen = mcSessionOrWorkspace.length;
    expect(afterFirstOpen).toBeGreaterThan(0);

    await page.getByRole("button", { name: /Voice Dictation/i }).click();
    await expect(
      page.getByTestId("heydoctor-copilot-voice-capability"),
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /^Continuity$/i }).click();
    const portal = page.getByTestId("continuity-panel-portal");
    if (await portal.count()) {
      await expect(portal).toBeVisible({ timeout: 10_000 });
      await expect(page.getByTestId("continuity-panel-shell")).toHaveAttribute(
        "data-continuity-host",
        "overlayHost",
      );
    }

    await page.keyboard.press("Escape");
    const firma = page.getByRole("button", { name: /^Firma$/i });
    if (await firma.count()) {
      await firma.first().click();
    }
    await expect(
      page.locator("#encounter-section-20").first(),
    ).toBeVisible({ timeout: 20_000 });

    await page
      .getByRole("button", { name: /Abrir HeyDoctor Copilot|Copilot/i })
      .first()
      .click();
    await expect(workspace).toBeVisible();
    await page.getByRole("button", { name: /Review & Sign/i }).click();
    await expect(
      page.getByTestId("heydoctor-copilot-review-sign-capability"),
    ).toBeVisible({ timeout: 10_000 });

    const mid = mcSessionOrWorkspace.length;
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: /Abrir HeyDoctor Copilot|Copilot|opened/i })
      .first()
      .click();
    await expect(workspace).toBeVisible();
    await page.waitForTimeout(800);
    // Session reuse — no bootstrap storm on reopen
    expect(mcSessionOrWorkspace.length - mid).toBeLessThan(6);
    expect(afterFirstOpen).toBeGreaterThan(0);
  });
});
