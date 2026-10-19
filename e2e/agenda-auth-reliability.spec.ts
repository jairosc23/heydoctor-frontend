/**
 * F2-01 — Agenda & Auth End-to-End Reliability
 *
 * Protects critical auth + Agenda Enterprise behaviour before product evolution.
 * Reuses PQ-01 fixtures/helpers. No clinical / Copilot / WebRTC / BE changes.
 *
 * Auth triad only: E2E_BASE_URL, E2E_DOCTOR_EMAIL, E2E_DOCTOR_PASSWORD
 * Mutating agenda CRUD soft-skips when QA has no patients (F2-05 residual).
 */
import {
  test,
  expect,
  configureAgendaAuthSuite,
} from "./fixtures/agenda-auth";
import {
  assertAuthenticatedPanel,
  expectProtectedRouteRequiresLogin,
  expectSessionLossRedirectsToLogin,
  gotoAuthenticatedPath,
  loginAsDoctor,
  logoutDoctor,
} from "./helpers/auth";
import {
  agendaHasSelectablePatient,
  cancelOpenAppointment,
  editOpenAppointmentReason,
  expectAgendaShellHealthy,
  expectAgendaWorkspaceTabs,
  expectAvailabilitySurface,
  fillNewAppointmentForm,
  goToAgendaDayForDraft,
  gotoAgenda,
  openAppointmentByPatientAndTime,
  openNewAppointmentModal,
  saveAppointmentModal,
} from "./helpers/agenda";
import { isE2EAuthReady } from "./helpers/env";
import { AGENDA_QA_DATASET } from "./fixtures/agenda-qa-dataset";

test.describe("F2-01 — Auth reliability", () => {
  configureAgendaAuthSuite();

  test("AUTH-01 login doctor lands outside /login", async ({ page }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await loginAsDoctor(page);
    await assertAuthenticatedPanel(page);
  });

  test("AUTH-02 navegación autenticada a Agenda", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await expectAgendaShellHealthy(page);
  });

  test("AUTH-03 persistencia de sesión tras reload (refresh path)", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await page.reload({ waitUntil: "domcontentloaded" });
    await assertAuthenticatedPanel(page);
    await expect(
      page.getByRole("heading", { name: /agenda médica/i }),
    ).toBeVisible({ timeout: 45_000 });
  });

  test("AUTH-04 logout vuelve a /login", async ({ doctorPage: page }) => {
    await gotoAuthenticatedPath(page, "/panel/consultas");
    await logoutDoctor(page);
    await expect(page.getByLabel(/correo|email/i)).toBeVisible();
  });

  test("AUTH-05 ruta protegida sin sesión → login", async ({ page }) => {
    test.skip(!isE2EAuthReady(), "Requiere triad E2E auth");
    await expectProtectedRouteRequiresLogin(page, "/panel/agenda");
  });

  test("AUTH-06 pérdida de sesión → login + recuperación (re-login)", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await expectSessionLossRedirectsToLogin(page);
    await loginAsDoctor(page);
    await gotoAgenda(page);
    await expectAgendaShellHealthy(page);
  });
});

test.describe("F2-01 — Agenda Enterprise reliability", () => {
  configureAgendaAuthSuite();

  test("AGENDA-01 shell + indicadores sin error fatal", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await expectAgendaShellHealthy(page);
    await expectAgendaWorkspaceTabs(page);
  });

  test("AGENDA-02 superficie de disponibilidad enterprise", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await expectAvailabilitySurface(page);
  });

  test("AGENDA-03 modal Nueva cita (validación UI crítica)", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await openNewAppointmentModal(page);
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(/inicio/i)).toBeVisible();
    await expect(dialog.getByLabel(/duración/i)).toBeVisible();
    await expect(dialog.getByRole("button", { name: /^guardar$/i })).toBeVisible();
    await dialog.getByRole("button", { name: /^cerrar$/i }).click();
    await expect(dialog).toBeHidden();
  });

  test("AGENDA-04 ciclo crear → editar → cancelar cita", async ({
    doctorPage: page,
  }) => {
    await gotoAgenda(page);
    await openNewAppointmentModal(page);

    const hasPatients = await agendaHasSelectablePatient(page);
    test.skip(
      !hasPatients,
      `Dataset QA sin pacientes — aplicar seed:e2e (patient ${AGENDA_QA_DATASET.patientEmail})`,
    );

    const marker = `F2-01 E2E ${Date.now()}`;
    const draft = await fillNewAppointmentForm(page, marker);
    await saveAppointmentModal(page);

    await goToAgendaDayForDraft(page, draft.startsAtLocal);
    await openAppointmentByPatientAndTime(
      page,
      draft.patientLabel,
      draft.timeLabel,
    );

    const edited = `${marker} edited`;
    await editOpenAppointmentReason(page, edited);

    await openAppointmentByPatientAndTime(
      page,
      draft.patientLabel,
      draft.timeLabel,
    );
    await expect(page.getByRole("dialog").getByLabel(/^motivo$/i)).toHaveValue(
      edited,
    );
    await cancelOpenAppointment(page);
    await expectAgendaShellHealthy(page);
  });
});
