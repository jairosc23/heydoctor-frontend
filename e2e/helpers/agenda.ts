/**
 * F2-01 — Agenda Enterprise helpers (UI only).
 * Reuses PQ-01 auth; does not invent parallel fixtures.
 */
import { expect, type Page } from "@playwright/test";
import { gotoAuthenticatedPath } from "./auth";

const AGENDA_PATH = "/panel/agenda";

export async function gotoAgenda(page: Page): Promise<void> {
  await gotoAuthenticatedPath(page, AGENDA_PATH);
  await expect(
    page.getByRole("heading", { name: /agenda médica/i }),
  ).toBeVisible({ timeout: 45_000 });
}

/** Shell + enterprise indicators must render without fatal error badge. */
export async function expectAgendaShellHealthy(page: Page): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /agenda médica/i }),
  ).toBeVisible();
  await expect(
    page.getByLabel(/indicadores de agenda/i),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /nueva cita/i })).toBeVisible();
  // Fatal list error surfaces as badge "Error" / "citas"
  const fatal = page.getByLabel(/indicadores de agenda/i).getByText(/^Error$/i);
  await expect(fatal).toHaveCount(0);
}

export async function openNewAppointmentModal(page: Page): Promise<void> {
  await page.getByRole("button", { name: /nueva cita/i }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible({ timeout: 20_000 });
  await expect(dialog.getByRole("heading", { name: /nueva cita/i })).toBeVisible();
}

/** Returns false when QA dataset has no patients (documents F2-05 dependency). */
export async function agendaHasSelectablePatient(page: Page): Promise<boolean> {
  const dialog = page.getByRole("dialog");
  const patientSelect = dialog.getByLabel(/^paciente$/i);
  if ((await patientSelect.count()) === 0) return false;
  const optionCount = await patientSelect.locator("option").count();
  return optionCount > 1;
}

export async function selectFirstPatient(
  page: Page,
): Promise<{ id: string; label: string }> {
  const dialog = page.getByRole("dialog");
  const patientSelect = dialog.getByLabel(/^paciente$/i);
  const options = patientSelect.locator("option");
  const count = await options.count();
  if (count <= 1) {
    throw new Error(
      "[F2-01] No patients in agenda modal — configure QA dataset (F2-05)",
    );
  }
  const id = (await options.nth(1).getAttribute("value")) ?? "";
  const label = ((await options.nth(1).textContent()) ?? "").trim();
  await patientSelect.selectOption({ index: 1 });
  return { id, label };
}

/** Schedule ~2 days ahead at 10:00 local to reduce collision with business hours blocks. */
export function futureLocalDatetimeValue(daysAhead = 2): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(10, 0, 0, 0);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export type NewAppointmentDraft = {
  patientLabel: string;
  startsAtLocal: string;
  timeLabel: string;
  reason: string;
};

export async function fillNewAppointmentForm(
  page: Page,
  reason: string,
): Promise<NewAppointmentDraft> {
  const dialog = page.getByRole("dialog");
  const patient = await selectFirstPatient(page);

  const doctorSelect = dialog.getByLabel(/^médico$/i);
  if ((await doctorSelect.count()) > 0) {
    const doctorOptions = doctorSelect.locator("option");
    const n = await doctorOptions.count();
    if (n > 1) {
      await doctorSelect.selectOption({ index: 1 });
    }
  }

  const startsAtLocal = futureLocalDatetimeValue();
  await dialog.getByLabel(/inicio/i).fill(startsAtLocal);
  await dialog.getByLabel(/duración/i).fill("30");
  await dialog.getByLabel(/^motivo$/i).fill(reason);
  return {
    patientLabel: patient.label,
    startsAtLocal,
    timeLabel: "10:00",
    reason,
  };
}

export async function saveAppointmentModal(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /^guardar$/i }).click();
  await expect(dialog).toBeHidden({ timeout: 45_000 });
}

export async function openFirstDayAppointment(page: Page): Promise<boolean> {
  const empty = page.getByText(/sin citas programadas/i);
  if ((await empty.count()) > 0 && (await empty.isVisible())) {
    return false;
  }
  // Prefer day list ("Citas del día")
  const listBtn = page.locator("aside").getByRole("button").first();
  if ((await listBtn.count()) === 0) {
    return false;
  }
  await listBtn.click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: /editar cita/i }),
  ).toBeVisible();
  return true;
}

/**
 * Open edit modal for a day-list appointment matching patient + time.
 * (Reason is not rendered on calendar cards.)
 */
export async function openAppointmentByPatientAndTime(
  page: Page,
  patientLabel: string,
  timeLabel: string,
): Promise<void> {
  const target = page
    .locator("aside")
    .getByRole("button")
    .filter({ hasText: patientLabel })
    .filter({ hasText: timeLabel })
    .first();
  await expect(target).toBeVisible({ timeout: 45_000 });
  await target.click();
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole("dialog").getByRole("heading", { name: /editar cita/i }),
  ).toBeVisible();
}

/** Switch calendar to Day view (aside list + hour grid). */
export async function switchToDayView(page: Page): Promise<void> {
  const dayBtn = page
    .getByRole("group", { name: /vista de calendario/i })
    .getByRole("button", { name: /^día$/i });
  await dayBtn.click();
  await expect(dayBtn).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText(/citas del día/i)).toBeVisible({
    timeout: 20_000,
  });
}

/** Jump calendar to the draft day so the new appointment is in the day list. */
export async function goToAgendaDayForDraft(
  page: Page,
  startsAtLocal: string,
): Promise<void> {
  await switchToDayView(page);
  const target = new Date(startsAtLocal);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDay = new Date(target);
  targetDay.setHours(0, 0, 0, 0);
  const deltaDays = Math.round(
    (targetDay.getTime() - today.getTime()) / 86_400_000,
  );
  await page.getByRole("button", { name: /^hoy$/i }).click();
  const next = page.getByRole("button", { name: /periodo siguiente/i });
  for (let i = 0; i < Math.max(0, deltaDays); i += 1) {
    await next.click();
  }
}

export async function editOpenAppointmentReason(
  page: Page,
  reason: string,
): Promise<void> {
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/^motivo$/i).fill(reason);
  await saveAppointmentModal(page);
}

export async function cancelOpenAppointment(page: Page): Promise<void> {
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: /cancelar cita/i }).click();
  await expect(dialog).toBeHidden({ timeout: 45_000 });
}

/** Availability enterprise section (doctor) or admin guidance. */
export async function expectAvailabilitySurface(page: Page): Promise<void> {
  const availability = page.getByLabel(/disponibilidad enterprise/i);
  const adminHint = page.getByText(/seleccione un médico/i);
  await expect(availability.or(adminHint).first()).toBeVisible({
    timeout: 45_000,
  });
}

/** Workspace tabs: critical navigation without product changes. */
export async function expectAgendaWorkspaceTabs(page: Page): Promise<void> {
  const tablist = page.getByRole("tablist");
  await expect(tablist).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole("tab").first()).toBeVisible();
}

export { AGENDA_PATH };
