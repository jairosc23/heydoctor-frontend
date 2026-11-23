export function defaultAvailabilityWindow(days = 7): {
  from: string;
  to: string;
} {
  // Keep the calendar slot grid aligned; expired slots are removed by the API
  // and guarded again at render time.
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + days);
  return { from: from.toISOString(), to: to.toISOString() };
}

/** Always compare absolute instants; IANA timezone is only for display. */
export function futurePublicSlot(
  slot: { startsAt: string; endsAt: string } | null,
  now: Date = new Date(),
): boolean {
  if (!slot) return false;
  const start = Date.parse(slot.startsAt);
  const end = Date.parse(slot.endsAt);
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    start > now.getTime() &&
    end > start
  );
}

export function formatPublicSlot(
  iso: string,
  timeZone?: string | null,
): string {
  try {
    return new Intl.DateTimeFormat("es-CL", {
      timeZone: timeZone || undefined,
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString("es-CL");
  }
}

export function doctorInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}
