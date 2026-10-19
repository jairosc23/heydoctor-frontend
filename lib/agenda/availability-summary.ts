import type {
  AvailabilitySlot,
  DoctorAvailabilityRule,
} from "@/lib/services/appointments-availability";

export type AvailabilityMode = "enterprise_rules" | "fallback_hours";

export type AvailabilitySummary = {
  mode: AvailabilityMode;
  activeRules: number;
  freeSlotsInRange: number;
  nextSlotStartsAt: string | null;
  /** Human-readable weekday windows (clinic-local minutes). */
  weeklyWindows: string[];
};

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

export function formatMinutesAsClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildWeeklyWindows(
  rules: DoctorAvailabilityRule[],
): string[] {
  return [...rules]
    .filter((r) => r.isActive)
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMinutes - b.startMinutes)
    .map((r) => {
      const day = DAY_LABELS[r.dayOfWeek] ?? `D${r.dayOfWeek}`;
      return `${day} ${formatMinutesAsClock(r.startMinutes)}–${formatMinutesAsClock(r.endMinutes)}`;
    });
}

/**
 * Summarize enterprise availability from BE SSOT payloads (rules + slots).
 * Mode is enterprise when active rules exist; otherwise clinic fallback 07:00–21:00.
 */
export function summarizeAvailability(
  rules: DoctorAvailabilityRule[],
  slots: AvailabilitySlot[],
): AvailabilitySummary {
  const active = rules.filter((r) => r.isActive);
  const sortedSlots = [...slots].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  return {
    mode: active.length > 0 ? "enterprise_rules" : "fallback_hours",
    activeRules: active.length,
    freeSlotsInRange: sortedSlots.length,
    nextSlotStartsAt: sortedSlots[0]?.startsAt ?? null,
    weeklyWindows: buildWeeklyWindows(active),
  };
}

/** Cap slot query window for month view to avoid large payloads (Phase 1). */
export function availabilitySlotsQueryRange(
  viewFrom: string,
  viewTo: string,
  view: "month" | "week" | "day",
  anchorIso: string,
): { from: string; to: string } {
  if (view !== "month") {
    return { from: viewFrom, to: viewTo };
  }
  const anchor = new Date(anchorIso);
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  end.setMilliseconds(end.getMilliseconds() - 1);
  const fromMs = Math.max(start.getTime(), new Date(viewFrom).getTime());
  const toMs = Math.min(end.getTime(), new Date(viewTo).getTime());
  return {
    from: new Date(fromMs).toISOString(),
    to: new Date(toMs).toISOString(),
  };
}
