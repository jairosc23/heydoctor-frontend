import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type {
  CreateWaitlistEntryPayload,
  WaitlistEntry,
} from "@/lib/services/appointments";

export type WaitlistEntryFormState = {
  patientId: string;
  doctorId: string;
  preferredFromLocal: string;
  preferredToLocal: string;
  reason: string;
  priority: number;
  statusActive: boolean;
};

export function emptyWaitlistEntryForm(
  doctorId = "",
  clinicTimezone: string,
): WaitlistEntryFormState {
  const now = toZonedTime(new Date(), clinicTimezone);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return {
    patientId: "",
    doctorId,
    preferredFromLocal: `${day}T09:00`,
    preferredToLocal: `${day}T18:00`,
    reason: "",
    priority: 100,
    statusActive: true,
  };
}

function toDatetimeLocal(iso: string, clinicTimezone: string): string {
  try {
    const zoned = toZonedTime(new Date(iso), clinicTimezone);
    const y = zoned.getFullYear();
    const m = String(zoned.getMonth() + 1).padStart(2, "0");
    const d = String(zoned.getDate()).padStart(2, "0");
    const hh = String(zoned.getHours()).padStart(2, "0");
    const mm = String(zoned.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${d}T${hh}:${mm}`;
  } catch {
    return iso.slice(0, 16);
  }
}

function localInputToIso(local: string, clinicTimezone: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  try {
    return fromZonedTime(local, clinicTimezone).toISOString();
  } catch {
    return null;
  }
}

export function waitlistEntryToFormState(
  entry: WaitlistEntry,
  clinicTimezone: string,
): WaitlistEntryFormState {
  return {
    patientId: entry.patientId,
    doctorId: entry.doctorId,
    preferredFromLocal: toDatetimeLocal(entry.preferredFrom, clinicTimezone),
    preferredToLocal: toDatetimeLocal(entry.preferredTo, clinicTimezone),
    reason: entry.reason ?? "",
    priority: entry.priority ?? 100,
    statusActive: entry.status === "active",
  };
}

export type WaitlistFormValidation = {
  ok: boolean;
  errors: string[];
  payload?: CreateWaitlistEntryPayload;
};

export function validateWaitlistEntryForm(
  form: WaitlistEntryFormState,
  options: {
    requireDoctorId: boolean;
    clinicTimezone: string;
    requirePatientId: boolean;
  },
): WaitlistFormValidation {
  const errors: string[] = [];
  if (options.requirePatientId && !form.patientId.trim()) {
    errors.push("Seleccione un paciente");
  }
  if (options.requireDoctorId && !form.doctorId.trim()) {
    errors.push("Seleccione un profesional");
  }
  if (!Number.isInteger(form.priority) || form.priority < 1 || form.priority > 999) {
    errors.push("La prioridad debe ser un entero entre 1 y 999");
  }

  const preferredFrom = localInputToIso(
    form.preferredFromLocal,
    options.clinicTimezone,
  );
  const preferredTo = localInputToIso(
    form.preferredToLocal,
    options.clinicTimezone,
  );
  if (!preferredFrom) errors.push("Inicio de ventana inválido");
  if (!preferredTo) errors.push("Fin de ventana inválido");
  if (
    preferredFrom &&
    preferredTo &&
    new Date(preferredTo) <= new Date(preferredFrom)
  ) {
    errors.push("El fin de ventana debe ser posterior al inicio");
  }

  if (errors.length || !preferredFrom || !preferredTo) {
    return { ok: false, errors };
  }

  const payload: CreateWaitlistEntryPayload = {
    patientId: form.patientId,
    preferredFrom,
    preferredTo,
    clinicTimezone: options.clinicTimezone,
    priority: form.priority,
  };
  if (form.doctorId) payload.doctorId = form.doctorId;
  if (form.reason.trim()) payload.reason = form.reason.trim();

  return { ok: true, errors: [], payload };
}

export function waitlistPatientLabel(entry: WaitlistEntry): string {
  const p = entry.patient;
  if (!p) return `Paciente ${entry.patientId.slice(0, 8)}…`;
  return (
    p.name ||
    [p.firstName ?? p.firstname, p.lastName ?? p.lastname]
      .filter(Boolean)
      .join(" ") ||
    `Paciente ${entry.patientId.slice(0, 8)}…`
  );
}
