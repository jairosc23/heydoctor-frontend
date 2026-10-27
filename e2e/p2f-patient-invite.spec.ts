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
    await expect(page.getByText("PENDING_CONFIRMATION")).toBeVisible();
    const register = page.getByRole("link", { name: "Crear cuenta paciente y guardar esta cita" });
    await expect(register).toBeVisible();
    await expect(register).toHaveAttribute("href", "/portal/register?bookingToken=qa-booking-A");
    await register.click();
    await expect(page).toHaveURL(/\/portal\/register\?bookingToken=qa-booking-A$/);
    expect(page.url()).not.toContain("qa-private-invite-A");
    await page.getByPlaceholder("Nombre completo").fill("Paciente sintético QA");
    await page.getByPlaceholder("Email (el mismo de la reserva)").fill("p2f@example.com");
    await page.getByPlaceholder("Contraseña (mín. 6)").fill("Only-QA-Example-2026!");
    await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeEnabled();
  });

  test("submits only the matching booking proof in patient registration HTTP request", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("hd_portal_invite:qa-booking-A", "qa-proof-A");
      sessionStorage.setItem("hd_portal_invite:qa-booking-B", "qa-proof-B");
    });
    let submitted: Record<string, unknown> | null = null;
    await page.route("**/api/auth/csrf", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ csrfToken: "qa-csrf-only-value" }) });
    });
    await page.route("**/api/auth/patient/register", async (route) => {
      submitted = route.request().postDataJSON() as Record<string, unknown>;
      // Synthetic rejection prevents the browser test from fabricating an authenticated
      // patient session; backend positive registration is certified separately.
      await route.fulfill({
        status: 422,
        contentType: "application/json",
        body: JSON.stringify({ message: "QA synthetic rejection; no account created" }),
      });
    });
    await page.goto("/portal/register?bookingToken=qa-booking-A");
    await page.getByPlaceholder("Nombre completo").fill("Paciente sintético QA");
    await page.getByPlaceholder("Email (el mismo de la reserva)").fill("p2f@example.com");
    await page.getByPlaceholder("Contraseña (mín. 6)").fill("Only-QA-Example-2026!");
    const sent = page.waitForRequest((req) => req.url().endsWith("/api/auth/patient/register") && req.method() === "POST");
    await page.getByRole("button", { name: "Crear cuenta" }).click();
    await sent;
    expect(submitted).toMatchObject({
      name: "Paciente sintético QA",
      email: "p2f@example.com",
      bookingToken: "qa-booking-A",
      inviteToken: "qa-proof-A",
    });
    expect(JSON.stringify(submitted)).not.toContain("qa-proof-B");
    expect(page.url()).not.toContain("qa-proof-A");
    expect(page.url()).not.toContain("qa-proof-B");
    await expect(page.getByRole("heading", { name: "Crear cuenta paciente" })).toBeVisible();
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
