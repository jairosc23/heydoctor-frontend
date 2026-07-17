import type { AvailabilitySummary } from "@/lib/agenda/availability-summary";
import type { Appointment } from "@/lib/services/appointments";
import type {
  AppointmentReminder,
  ReminderPolicy,
  WaitlistEntry,
} from "@/lib/services/appointments";
import type {
  AvailabilitySlot,
  DoctorAvailabilityRule,
  ScheduleBlock,
} from "@/lib/services/appointments-availability";

export type AgendaHealthTone = "success" | "warning" | "danger" | "neutral";

export type AgendaDashboardMetrics = {
  healthLabel: string;
  healthTone: AgendaHealthTone;
  healthHint: string;
  timezone: string;
  timezoneSource: string;
  totalAppointments: number;
  upcomingAppointments: Appointment[];
  freeSlotCount: number;
  freeHoursApprox: number;
  occupiedHoursApprox: number;
  activeRules: number;
  totalRules: number;
  availabilityMode: AvailabilitySummary["mode"] | "unknown";
  nextFreeSlotAt: string | null;
  weeklyWindows: string[];
  activeBlocks: number;
  totalBlocks: number;
  waitlistActive: number;
  waitlistTotal: number;
  remindersScheduled: number;
  remindersSent: number;
  remindersFailed: number;
  reminderPoliciesActive: number;
  reminderPoliciesTotal: number;
};

function hoursBetween(startsAt?: string, endsAt?: string): number {
  if (!startsAt || !endsAt) return 0;
  const ms = new Date(endsAt).getTime() - new Date(startsAt).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return ms / 3_600_000;
}

function appointmentHours(a: Appointment): number {
  if (a.startsAt && a.endsAt) return hoursBetween(a.startsAt, a.endsAt);
  if (a.startsAt && a.durationMinutes) {
    return a.durationMinutes / 60;
  }
  return 0;
}

/**
 * Derive read-only dashboard KPIs from already-fetched Agenda Enterprise SSOT payloads.
 * Presentation aggregation only — no new business rules or API calls.
 */
export function buildAgendaDashboardMetrics(input: {
  appointments: Appointment[];
  slots: AvailabilitySlot[] | undefined;
  rules: DoctorAvailabilityRule[] | undefined;
  summary: AvailabilitySummary | undefined;
  blocks: ScheduleBlock[] | undefined;
  waitlist: WaitlistEntry[] | undefined;
  reminders: AppointmentReminder[] | undefined;
  reminderPolicies: ReminderPolicy[] | undefined;
  timezone: string;
  timezoneSource: string;
  requiresDoctorId: boolean;
  hasAppointmentsError: boolean;
  hasAvailabilityError: boolean;
  nowIso?: string;
}): AgendaDashboardMetrics {
  const now = new Date(input.nowIso ?? Date.now()).getTime();
  const appointments = input.appointments ?? [];
  const slots = input.slots ?? [];
  const rules = input.rules ?? [];
  const blocks = input.blocks ?? [];
  const waitlist = input.waitlist ?? [];
  const reminders = input.reminders ?? [];
  const policies = input.reminderPolicies ?? [];

  const upcomingAppointments = [...appointments]
    .filter((a) => {
      if (!a.startsAt) return false;
      const t = new Date(a.startsAt).getTime();
      if (!Number.isFinite(t) || t < now) return false;
      const status = (a.calendarStatus ?? a.status ?? "").toString().toUpperCase();
      return status !== "CANCELLED" && status !== "NO_SHOW";
    })
    .sort((a, b) =>
      (a.startsAt ?? "").localeCompare(b.startsAt ?? ""),
    )
    .slice(0, 5);

  const freeHoursApprox = Math.round(
    slots.reduce((acc, s) => acc + hoursBetween(s.startsAt, s.endsAt), 0) * 10,
  ) / 10;

  const occupiedHoursApprox = Math.round(
    appointments.reduce((acc, a) => {
      const status = (a.calendarStatus ?? a.status ?? "").toString().toUpperCase();
      if (status === "CANCELLED" || status === "NO_SHOW") return acc;
      return acc + appointmentHours(a);
    }, 0) * 10,
  ) / 10;

  const activeRules = rules.filter((r) => r.isActive).length;
  const activeBlocks = blocks.filter((b) => b.isActive !== false).length;
  const waitlistActive = waitlist.filter((e) => e.status === "active").length;
  const remindersScheduled = reminders.filter(
    (r) => r.status === "scheduled",
  ).length;
  const remindersSent = reminders.filter((r) => r.status === "sent").length;
  const remindersFailed = reminders.filter((r) => r.status === "failed").length;
  const reminderPoliciesActive = policies.filter((p) => p.isActive).length;

  let healthLabel = "Operativa";
  let healthTone: AgendaHealthTone = "success";
  let healthHint = "Agenda enterprise sincronizada con SSOT backend.";

  if (input.hasAppointmentsError || input.hasAvailabilityError) {
    healthLabel = "Degradada";
    healthTone = "danger";
    healthHint = "Algunas consultas fallaron; el resto permanece de solo lectura.";
  } else if (input.requiresDoctorId) {
    healthLabel = "Pendiente de médico";
    healthTone = "warning";
    healthHint = "Admin: seleccione un profesional para métricas de disponibilidad.";
  } else if (waitlistActive > 0 || remindersFailed > 0) {
    healthLabel = "Atención";
    healthTone = "warning";
    healthHint =
      waitlistActive > 0
        ? "Hay pacientes en lista de espera activa."
        : "Hay recordatorios fallidos en el rango.";
  }

  return {
    healthLabel,
    healthTone,
    healthHint,
    timezone: input.timezone,
    timezoneSource: input.timezoneSource,
    totalAppointments: appointments.length,
    upcomingAppointments,
    freeSlotCount: slots.length,
    freeHoursApprox,
    occupiedHoursApprox,
    activeRules: input.summary?.activeRules ?? activeRules,
    totalRules: rules.length,
    availabilityMode: input.summary?.mode ?? "unknown",
    nextFreeSlotAt:
      input.summary?.nextSlotStartsAt ?? slots[0]?.startsAt ?? null,
    weeklyWindows: input.summary?.weeklyWindows ?? [],
    activeBlocks,
    totalBlocks: blocks.length,
    waitlistActive,
    waitlistTotal: waitlist.length,
    remindersScheduled,
    remindersSent,
    remindersFailed,
    reminderPoliciesActive,
    reminderPoliciesTotal: policies.length,
  };
}

export function formatHoursLabel(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0 h";
  if (hours < 1) return `${Math.round(hours * 60)} min`;
  return `${hours.toFixed(hours % 1 === 0 ? 0 : 1)} h`;
}
