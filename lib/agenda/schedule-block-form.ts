import { fromZonedTime, toZonedTime } from "date-fns-tz";
import type {
  CreateScheduleBlockPayload,
  ScheduleBlock,
} from "@/lib/services/appointments-availability";

export type BlockMode = "range" | "full_day";

export type ScheduleBlockFormState = {
  mode: BlockMode;
  /** yyyy-MM-dd for full_day; ignored for range */
  dayDate: string;
  /** datetime-local value for range start */
  startsLocal: string;
  /** datetime-local value for range end */
  endsLocal: string;
  reason: string;
  doctorId: string;
  /** Admin: omit doctor → clinic-wide block */
  clinicWide: boolean;
  isActive: boolean;
};

export function emptyScheduleBlockForm(
  doctorId = "",
  clinicTimezone: string,
): ScheduleBlockFormState {
  const now = toZonedTime(new Date(), clinicTimezone);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const day = `${y}-${m}-${d}`;
  return {
    mode: "range",
    dayDate: day,
    startsLocal: `${day}T09:00`,
    endsLocal: `${day}T10:00`,
    reason: "",
    doctorId,
    clinicWide: false,
    isActive: true,
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

export function blockToFormState(
  block: ScheduleBlock,
  clinicTimezone: string,
): ScheduleBlockFormState {
  const startsLocal = toDatetimeLocal(block.startsAt, clinicTimezone);
  const endsLocal = toDatetimeLocal(block.endsAt, clinicTimezone);
  const dayDate = startsLocal.slice(0, 10);
  const startsZ = toZonedTime(new Date(block.startsAt), clinicTimezone);
  const endsZ = toZonedTime(new Date(block.endsAt), clinicTimezone);
  const isFullDay =
    startsZ.getHours() === 0 &&
    startsZ.getMinutes() === 0 &&
    endsZ.getHours() === 23 &&
    endsZ.getMinutes() >= 59;
  return {
    mode: isFullDay ? "full_day" : "range",
    dayDate,
    startsLocal,
    endsLocal,
    reason: block.reason ?? "",
    doctorId: block.doctorId ?? "",
    clinicWide: block.doctorId == null,
    isActive: block.isActive !== false,
  };
}

function localInputToIso(local: string, clinicTimezone: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null;
  try {
    return fromZonedTime(local, clinicTimezone).toISOString();
  } catch {
    return null;
  }
}

export type BlockFormValidation = {
  ok: boolean;
  errors: string[];
  payload?: CreateScheduleBlockPayload;
};

export function validateScheduleBlockForm(
  form: ScheduleBlockFormState,
  options: {
    requireDoctorId: boolean;
    clinicTimezone: string;
  },
): BlockFormValidation {
  const errors: string[] = [];
  if (options.requireDoctorId && !form.clinicWide && !form.doctorId.trim()) {
    errors.push("Seleccione un médico o marque bloqueo de clínica");
  }

  let startsAt: string | null = null;
  let endsAt: string | null = null;

  if (form.mode === "full_day") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.dayDate)) {
      errors.push("Fecha de día completo inválida");
    } else {
      try {
        startsAt = fromZonedTime(
          `${form.dayDate}T00:00:00`,
          options.clinicTimezone,
        ).toISOString();
        endsAt = fromZonedTime(
          `${form.dayDate}T23:59:59`,
          options.clinicTimezone,
        ).toISOString();
      } catch {
        errors.push("No se pudo calcular el día completo");
      }
    }
  } else {
    startsAt = localInputToIso(form.startsLocal, options.clinicTimezone);
    endsAt = localInputToIso(form.endsLocal, options.clinicTimezone);
    if (!startsAt) errors.push("Inicio inválido");
    if (!endsAt) errors.push("Fin inválido");
  }

  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt)) {
    errors.push("El fin debe ser posterior al inicio");
  }

  if (errors.length || !startsAt || !endsAt) {
    return { ok: false, errors };
  }

  const payload: CreateScheduleBlockPayload = {
    startsAt,
    endsAt,
    isActive: form.isActive,
  };
  if (form.reason.trim()) payload.reason = form.reason.trim();
  if (!form.clinicWide && form.doctorId) {
    payload.doctorId = form.doctorId;
  }

  return { ok: true, errors: [], payload };
}
