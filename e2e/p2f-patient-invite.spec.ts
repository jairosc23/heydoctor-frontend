import { test, expect } from "@playwright/test";

test.describe("P2-F patient portal registration — isolated browser", () => {
  test("rejects registration without booking invitation", async ({ page }) => {
    await page.goto("/portal/register?bookingToken=qa-booking-only");
    await expect(page.getByText(/necesitas una reserva pública y su invitación/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeDisabled();
  });

  test("retrieves matching invitation from same-tab sessionStorage without leaking it in URL", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("hd_portal_invite:qa-booking-A", "qa-invite-A");
      sessionStorage.setItem("hd_portal_invite:qa-booking-B", "qa-invite-B");
    });
    await page.goto("/portal/register?bookingToken=qa-booking-A");
    await expect(page.getByRole("heading", { name: "Crear cuenta paciente" })).toBeVisible();
    await expect(page.getByText(/necesitas una reserva pública y su invitación/i)).toHaveCount(0);
    await page.getByPlaceholder("Nombre completo").fill("Paciente sintético QA");
    await page.getByPlaceholder("Email (el mismo de la reserva)").fill("p2f@example.com");
    await page.getByPlaceholder("Contraseña (mín. 6)").fill("Only-QA-Example-2026!");
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
    expect(page.url()).not.toContain("qa-invite-A");
    expect(page.url()).not.toContain("qa-invite-B");
  });
});
