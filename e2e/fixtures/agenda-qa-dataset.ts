/**
 * F2-05 — Stable Agenda QA dataset contract for Playwright.
 * Aligns with BE `e2e-ci-seed.constants` / `seed.e2e.ts` (no PHI).
 */

export const AGENDA_QA_DATASET = {
  clinicName: "E2E CI Seed Clinic",
  doctorEmail: "e2e.ci.doctor@heydoctor.local",
  adminEmail: "e2e.ci.admin@heydoctor.local",
  patientEmail: "e2e.ci.patient@heydoctor.local",
  patientDisplayName: "E2E Paciente Seed",
  appointmentReasonMarker: "__E2E_SEED_APPT__",
  conflictBlockReasonMarker: "__E2E_SEED_BLOCK_CONFLICT__",
  /** Documented scenarios covered by seed */
  scenarios: [
    "patient_selectable_in_nueva_cita",
    "confirmed_appointment_future",
    "doctor_availability_rule_monday",
    "active_conflict_block",
  ],
} as const;

export type AgendaQaScenario = (typeof AGENDA_QA_DATASET.scenarios)[number];
