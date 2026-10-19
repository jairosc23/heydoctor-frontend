/**
 * P2-B4 — Clinical / Wave-3 surface E2E smokes.
 * Soft-skip without credentials (local). Strict failures when E2E_STRICT/CI + auth expected.
 */
import { test, expect } from "@playwright/test";
import {
  expectProtectedRouteRequiresLogin,
  loginAsDoctor,
} from "./helpers/auth";
import { isE2EAuthReady, isE2EStrict } from "./helpers/env";

test.describe("P2 clinical / intelligence surface smokes", () => {
  test("P2-AUTH /dev/w3-marketplace requires login when unauthenticated", async ({
    page,
  }) => {
    test.skip(
      !process.env.E2E_BASE_URL?.trim(),
      "Requiere E2E_BASE_URL para navegación absoluta",
    );
    await expectProtectedRouteRequiresLogin(page, "/dev/w3-marketplace");
  });

  test("P2-PANEL authenticated panel has no Confirm CTA bypass", async ({
    page,
  }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await page.goto("/panel");
    await expect(page.locator("body")).toBeVisible();
    await expect(page.getByRole("button", { name: /^Confirm$/i })).toHaveCount(
      0,
    );
  });

  test("P2-MARKETPLACE harness after auth (flag off or workspace)", async ({
    page,
  }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await page.goto("/dev/w3-marketplace");
    const disabled = page.getByTestId("w3-marketplace-disabled");
    const workspace = page.getByTestId("w3-marketplace-workspace");
    await expect(disabled.or(workspace).first()).toBeVisible({
      timeout: 15_000,
    });
    if (await workspace.isVisible().catch(() => false)) {
      await expect(workspace).toHaveAttribute("data-orchestration-only", "true");
      await expect(workspace).toHaveAttribute("data-owns-cos", "false");
    }
  });

  test("P2-MOBILE offline cannot modify authority when enabled", async ({
    page,
  }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await page.goto("/dev/w3-mobile");
    const disabled = page.getByTestId("w3-mobile-disabled");
    const workspace = page.getByTestId("w3-mobile-workspace");
    if (await workspace.isVisible().catch(() => false)) {
      await expect(workspace).toHaveAttribute(
        "data-offline-may-modify-authority",
        "false",
      );
      await expect(workspace).toHaveAttribute("data-governed-sync", "true");
    } else {
      await expect(disabled).toBeVisible();
    }
  });

  test("P2-INTEROP connectors never own COS when enabled", async ({ page }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await page.goto("/dev/w3-interop");
    const workspace = page.getByTestId("w3-interop-workspace");
    if (await workspace.isVisible().catch(() => false)) {
      await expect(workspace).toHaveAttribute("data-owns-cos", "false");
      await expect(workspace).toHaveAttribute("data-may-bypass-hab", "false");
    } else if (isE2EStrict()) {
      await expect(page.locator("main")).toBeVisible();
    }
  });
});
