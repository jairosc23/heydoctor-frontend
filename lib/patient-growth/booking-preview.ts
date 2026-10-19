/** Public booking stays a preview unless this flag is exactly "true". */
export function isBookingSubmitEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return (
    env.NEXT_PUBLIC_BOOKING_SUBMIT_ENABLED === "true" ||
    env.BOOKING_SUBMIT_ENABLED === "true"
  );
}

export function bookingIntent(submitEnabled: boolean): "preview" | "submit" {
  return submitEnabled ? "submit" : "preview";
}

export function formatPreviewSlot(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function slotOffsetLabel(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  }).formatToParts(new Date(iso));
  return parts.find((part) => part.type === "timeZoneName")?.value ?? "";
}
