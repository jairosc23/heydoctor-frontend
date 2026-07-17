import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

export type AgendaView = "month" | "week" | "day";

/**
 * Resolve clinic IANA timezone.
 * Prefer SSOT from backend (`clinicTimezone` / `/clinic/me`); browser only as last resort.
 */
export function resolveClinicTimezone(ssot?: string | null): string {
  if (ssot && typeof ssot === "string" && ssot.trim()) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: ssot.trim() }).format(
        new Date(),
      );
      return ssot.trim();
    } catch {
      /* fall through */
    }
  }
  try {
    return (
      Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Santiago"
    );
  } catch {
    return "America/Santiago";
  }
}

export function formatInClinic(
  iso: string | undefined,
  timeZone: string,
  pattern: string,
): string {
  if (!iso) return "—";
  try {
    return formatInTimeZone(new Date(iso), timeZone, pattern, { locale: undefined });
  } catch {
    return new Date(iso).toLocaleString("es-CL");
  }
}

export function getRangeForView(
  anchor: Date,
  view: AgendaView,
): { from: string; to: string } {
  if (view === "day") {
    const start = startOfDay(anchor);
    const end = endOfDay(anchor);
    return { from: start.toISOString(), to: end.toISOString() };
  }
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return { from: start.toISOString(), to: end.toISOString() };
  }
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function navigateAnchor(
  anchor: Date,
  view: AgendaView,
  direction: -1 | 1,
): Date {
  if (view === "day") return addDays(anchor, direction);
  if (view === "week") return addWeeks(anchor, direction);
  return addMonths(anchor, direction);
}

export function getViewTitle(anchor: Date, view: AgendaView, tz: string): string {
  if (view === "day") {
    return formatInClinic(anchor.toISOString(), tz, "EEEE d MMMM yyyy");
  }
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return `${formatInClinic(start.toISOString(), tz, "d MMM")} – ${formatInClinic(end.toISOString(), tz, "d MMM yyyy")}`;
  }
  return formatInClinic(anchor.toISOString(), tz, "MMMM yyyy");
}

export function monthGridDays(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

export function weekDays(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function dayHours(): number[] {
  return Array.from({ length: 14 }, (_, i) => i + 7);
}

export function eventFallsOnDay(
  startsAt: string | undefined,
  day: Date,
  timeZone: string,
): boolean {
  if (!startsAt) return false;
  const zoned = toZonedTime(new Date(startsAt), timeZone);
  return isSameDay(zoned, day);
}

export function eventTopPercent(
  startsAt: string,
  timeZone: string,
  dayStartHour = 7,
  spanHours = 14,
): number {
  const zoned = toZonedTime(new Date(startsAt), timeZone);
  const minutes = zoned.getHours() * 60 + zoned.getMinutes();
  const offset = dayStartHour * 60;
  const total = spanHours * 60;
  return Math.max(0, Math.min(100, ((minutes - offset) / total) * 100));
}

export function eventHeightPercent(
  startsAt: string,
  endsAt: string,
  spanHours = 14,
): number {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const minutes = Math.max(15, (end - start) / 60_000);
  return Math.min(100, (minutes / (spanHours * 60)) * 100);
}

export { format, isSameMonth, isSameDay };
