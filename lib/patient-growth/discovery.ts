export function defaultAvailabilityWindow(days = 7): { from: string; to: string } {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(to.getDate() + days);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function formatPublicSlot(iso: string, timeZone?: string | null): string {
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
