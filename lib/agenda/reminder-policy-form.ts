import type {
  CreateReminderPolicyPayload,
  ReminderAnchor,
  ReminderChannel,
  ReminderPolicy,
  ReminderType,
} from "@/lib/services/appointments";

export type ReminderPolicyFormState = {
  doctorId: string;
  clinicWide: boolean;
  type: ReminderType;
  channel: ReminderChannel;
  /** Absolute minutes for UI; sign inferred from before/after */
  offsetAmount: number;
  offsetUnit: "minutes" | "hours";
  beforeAnchor: boolean;
  anchor: ReminderAnchor;
  isActive: boolean;
};

export const REMINDER_TYPE_OPTIONS: { id: ReminderType; label: string }[] = [
  { id: "confirmation", label: "Confirmación" },
  { id: "upcoming", label: "Próxima cita" },
  { id: "no_show_risk", label: "Riesgo no-show" },
  { id: "follow_up", label: "Seguimiento" },
];

export const REMINDER_CHANNEL_OPTIONS: { id: ReminderChannel; label: string }[] =
  [
    { id: "email", label: "Correo" },
    { id: "sms", label: "SMS" },
    { id: "whatsapp", label: "WhatsApp" },
    { id: "push", label: "Push" },
  ];

export const OFFSET_PRESETS = [
  { label: "24 h antes", amount: 24, unit: "hours" as const, before: true },
  { label: "2 h antes", amount: 2, unit: "hours" as const, before: true },
  { label: "30 min antes", amount: 30, unit: "minutes" as const, before: true },
  { label: "Al momento", amount: 0, unit: "minutes" as const, before: true },
  {
    label: "24 h después",
    amount: 24,
    unit: "hours" as const,
    before: false,
  },
];

export function emptyReminderPolicyForm(
  doctorId = "",
): ReminderPolicyFormState {
  return {
    doctorId,
    clinicWide: false,
    type: "upcoming",
    channel: "email",
    offsetAmount: 24,
    offsetUnit: "hours",
    beforeAnchor: true,
    anchor: "starts_at",
    isActive: true,
  };
}

export function policyToFormState(
  policy: ReminderPolicy,
): ReminderPolicyFormState {
  const abs = Math.abs(policy.offsetMinutes);
  const useHours = abs >= 60 && abs % 60 === 0;
  return {
    doctorId: policy.doctorId ?? "",
    clinicWide: policy.doctorId == null,
    type: policy.type,
    channel: policy.channel,
    offsetAmount: useHours ? abs / 60 : abs,
    offsetUnit: useHours ? "hours" : "minutes",
    beforeAnchor: policy.offsetMinutes <= 0,
    anchor: policy.anchor ?? "starts_at",
    isActive: policy.isActive !== false,
  };
}

export function offsetMinutesFromForm(form: ReminderPolicyFormState): number {
  const raw =
    form.offsetUnit === "hours" ? form.offsetAmount * 60 : form.offsetAmount;
  if (raw === 0) return 0;
  return form.beforeAnchor ? -Math.abs(raw) : Math.abs(raw);
}

export function formatOffsetLabel(offsetMinutes: number): string {
  if (offsetMinutes === 0) return "Al momento";
  const abs = Math.abs(offsetMinutes);
  const unit =
    abs % 60 === 0 && abs >= 60
      ? `${abs / 60} h`
      : `${abs} min`;
  return offsetMinutes < 0 ? `${unit} antes` : `${unit} después`;
}

export type ReminderPolicyFormValidation = {
  ok: boolean;
  errors: string[];
  payload?: CreateReminderPolicyPayload;
};

export function validateReminderPolicyForm(
  form: ReminderPolicyFormState,
  options: { requireDoctorId: boolean },
): ReminderPolicyFormValidation {
  const errors: string[] = [];
  if (
    options.requireDoctorId &&
    !form.clinicWide &&
    !form.doctorId.trim()
  ) {
    errors.push("Seleccione un profesional o marque política de clínica");
  }
  if (!Number.isFinite(form.offsetAmount) || form.offsetAmount < 0) {
    errors.push("La anticipación debe ser un número ≥ 0");
  }
  if (errors.length) return { ok: false, errors };

  const payload: CreateReminderPolicyPayload = {
    type: form.type,
    channel: form.channel,
    offsetMinutes: offsetMinutesFromForm(form),
    anchor: form.anchor,
    isActive: form.isActive,
  };
  if (!form.clinicWide && form.doctorId) {
    payload.doctorId = form.doctorId;
  }

  return { ok: true, errors: [], payload };
}

export function reminderStatusLabel(status: string): string {
  switch (status) {
    case "scheduled":
      return "Pendiente";
    case "sent":
      return "Enviado";
    case "failed":
      return "Fallido";
    case "skipped":
      return "Cancelado";
    default:
      return status;
  }
}
