import { test, expect } from "@playwright/test";

test.describe("P2-F patient portal registration — isolated browser", () => {
  test("rejects registration without booking invitation", async ({ page }) => {
    await page.goto("/portal/register?bookingToken=qa-booking-only");
    await expect(page.getByText(/necesitas una reserva pública y su invitación/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeDisabled();
  });

  test("booking-status page hands off invitation to register without exposing its secret", async ({ page }) => {
    await page.route("**/public/bookings/qa-booking-A", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({
          appointmentId: "11111111-1111-4111-8111-111111111111",
          status: "PENDING_CONFIRMATION",
          paymentStatus: "not_required",
          startsAt: "2026-11-06T14:00:00.000Z",
          endsAt: "2026-11-06T14:30:00.000Z",
          telemedicineReady: false,
        }),
      });
    });
    await page.addInitScript(() => {
      sessionStorage.setItem("hd_portal_invite:qa-booking-A", "qa-private-invite-A");
    });
    await page.goto("/dr/booking/qa-booking-A");
    await expect(page.getByRole("heading", { name: "Estado de tu cita" })).toBeVisible();
    const register = page.getByRole("link", { name: "Crear cuenta paciente y guardar esta cita" });
    await expect(register).toBeVisible();
    await expect(register).toHaveAttribute("href", "/portal/register?bookingToken=qa-booking-A");
    await register.click();
    await expect(page).toHaveURL(/\/portal\/register\?bookingToken=qa-booking-A$/);
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeDisabled();
    expect(page.url()).not.toContain("qa-private-invite-A");
    await page.getByPlaceholder("Nombre completo").fill("Paciente sintético QA");
    await page.getByPlaceholder("Email (el mismo de la reserva)").fill("p2f@example.com");
    await page.getByPlaceholder("Contraseña (mín. 6)").fill("Only-QA-Example-2026!");
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
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
