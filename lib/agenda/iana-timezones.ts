/** Curated IANA identifiers for Agenda Enterprise (LatAm + common EU/US). */
export const AGENDA_IANA_TIMEZONES: { id: string; label: string }[] = [
  { id: "America/Santiago", label: "America/Santiago (Chile)" },
  { id: "America/Bogota", label: "America/Bogota (Colombia)" },
  { id: "America/Lima", label: "America/Lima (Perú)" },
  { id: "America/Guayaquil", label: "America/Guayaquil (Ecuador)" },
  { id: "America/Caracas", label: "America/Caracas (Venezuela)" },
  { id: "America/Argentina/Buenos_Aires", label: "America/Argentina/Buenos_Aires" },
  { id: "America/Sao_Paulo", label: "America/Sao_Paulo (Brasil)" },
  { id: "America/Mexico_City", label: "America/Mexico_City" },
  { id: "America/Panama", label: "America/Panama" },
  { id: "America/Costa_Rica", label: "America/Costa_Rica" },
  { id: "America/New_York", label: "America/New_York (US Eastern)" },
  { id: "America/Los_Angeles", label: "America/Los_Angeles (US Pacific)" },
  { id: "Europe/Madrid", label: "Europe/Madrid (España)" },
  { id: "Europe/London", label: "Europe/London" },
  { id: "UTC", label: "UTC" },
];

export function isValidIanaTimezone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

export function ensureIanaInOptions(timeZone: string): { id: string; label: string }[] {
  if (!timeZone || AGENDA_IANA_TIMEZONES.some((z) => z.id === timeZone)) {
    return AGENDA_IANA_TIMEZONES;
  }
  return [{ id: timeZone, label: timeZone }, ...AGENDA_IANA_TIMEZONES];
}
