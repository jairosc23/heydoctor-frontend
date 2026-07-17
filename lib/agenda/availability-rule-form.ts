import type { DoctorAvailabilityRule } from "@/lib/services/appointments-availability";
import type { CreateAvailabilityRulePayload } from "@/lib/services/appointments-availability";

export const DAY_OF_WEEK_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export type AvailabilityRuleFormState = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  effectiveFrom: string;
  effectiveUntil: string;
  isActive: boolean;
  doctorId: string;
};

export function clockToMinutes(value: string): number | null {
  const m = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

export function minutesToClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function emptyAvailabilityRuleForm(
  doctorId = "",
): AvailabilityRuleFormState {
  return {
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "13:00",
    effectiveFrom: "",
    effectiveUntil: "",
    isActive: true,
    doctorId,
  };
}

export function ruleToFormState(
  rule: DoctorAvailabilityRule,
): AvailabilityRuleFormState {
  return {
    dayOfWeek: rule.dayOfWeek,
    startTime: minutesToClock(rule.startMinutes),
    endTime: minutesToClock(rule.endMinutes),
    effectiveFrom: rule.effectiveFrom ?? "",
    effectiveUntil: rule.effectiveUntil ?? "",
    isActive: rule.isActive,
    doctorId: rule.doctorId,
  };
}

export type RuleFormValidation = {
  ok: boolean;
  errors: string[];
  payload?: CreateAvailabilityRulePayload;
};

/**
 * Validates against CreateAvailabilityRuleDto constraints (BE SSOT).
 */
export function validateAvailabilityRuleForm(
  form: AvailabilityRuleFormState,
  options: { requireDoctorId: boolean },
): RuleFormValidation {
  const errors: string[] = [];
  if (form.dayOfWeek < 0 || form.dayOfWeek > 6) {
    errors.push("Día de la semana inválido");
  }
  const startMinutes = clockToMinutes(form.startTime);
  const endMinutes = clockToMinutes(form.endTime);
  if (startMinutes == null) errors.push("Hora de inicio inválida (HH:mm)");
  if (endMinutes == null) errors.push("Hora de fin inválida (HH:mm)");
  if (
    startMinutes != null &&
    endMinutes != null &&
    endMinutes <= startMinutes
  ) {
    errors.push("La hora de fin debe ser posterior al inicio");
  }
  if (options.requireDoctorId && !form.doctorId.trim()) {
    errors.push("Seleccione un médico");
  }
  if (form.effectiveFrom && form.effectiveUntil) {
    if (form.effectiveUntil < form.effectiveFrom) {
      errors.push("La vigencia hasta debe ser ≥ vigencia desde");
    }
  }

  if (errors.length > 0 || startMinutes == null || endMinutes == null) {
    return { ok: false, errors };
  }

  const payload: CreateAvailabilityRulePayload = {
    dayOfWeek: form.dayOfWeek,
    startMinutes,
    endMinutes,
    isActive: form.isActive,
  };
  if (form.effectiveFrom) payload.effectiveFrom = form.effectiveFrom;
  if (form.effectiveUntil) payload.effectiveUntil = form.effectiveUntil;
  if (options.requireDoctorId || form.doctorId) {
    payload.doctorId = form.doctorId;
  }

  return { ok: true, errors: [], payload };
}
