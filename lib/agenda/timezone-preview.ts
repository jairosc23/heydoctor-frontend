import { formatInTimeZone } from "date-fns-tz";
import { isValidIanaTimezone } from "./iana-timezones";

export type TimezonePreview = {
  ok: boolean;
  sourceIso: string;
  clinicLocal: string;
  compareLocal: string;
  clinicOffset: string;
  compareOffset: string;
  dstNote: string;
  errors: string[];
};

function offsetLabel(iso: string, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date(iso));
    return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

function dstActive(iso: string, timeZone: string): boolean {
  try {
    const jan = new Date(Date.UTC(new Date(iso).getUTCFullYear(), 0, 1));
    const jul = new Date(Date.UTC(new Date(iso).getUTCFullYear(), 6, 1));
    const off = (d: Date) =>
      new Intl.DateTimeFormat("en-US", {
        timeZone,
        timeZoneName: "shortOffset",
      })
        .formatToParts(d)
        .find((p) => p.type === "timeZoneName")?.value ?? "";
    return off(jan) !== off(jul);
  } catch {
    return false;
  }
}

/**
 * Preview equivalent wall-clock times between clinic TZ and a comparison TZ.
 * Uses Intl / date-fns-tz (DST-aware via IANA).
 */
export function buildTimezonePreview(input: {
  instantIso?: string;
  clinicTimezone: string;
  compareTimezone: string;
}): TimezonePreview {
  const errors: string[] = [];
  if (!isValidIanaTimezone(input.clinicTimezone)) {
    errors.push("Timezone de clínica inválida");
  }
  if (!isValidIanaTimezone(input.compareTimezone)) {
    errors.push("Timezone de comparación inválida");
  }
  const sourceIso = input.instantIso ?? new Date().toISOString();
  if (Number.isNaN(new Date(sourceIso).getTime())) {
    errors.push("Instante inválido");
  }
  if (errors.length) {
    return {
      ok: false,
      sourceIso,
      clinicLocal: "—",
      compareLocal: "—",
      clinicOffset: "",
      compareOffset: "",
      dstNote: "",
      errors,
    };
  }

  const clinicLocal = formatInTimeZone(
    sourceIso,
    input.clinicTimezone,
    "yyyy-MM-dd HH:mm:ss zzz",
  );
  const compareLocal = formatInTimeZone(
    sourceIso,
    input.compareTimezone,
    "yyyy-MM-dd HH:mm:ss zzz",
  );
  const clinicDst = dstActive(sourceIso, input.clinicTimezone);
  const compareDst = dstActive(sourceIso, input.compareTimezone);
  const dstNote =
    clinicDst || compareDst
      ? "DST soportado vía IANA (offsets pueden variar según estación)."
      : "Sin variación DST observada entre ene/jul para estas zonas.";

  return {
    ok: true,
    sourceIso,
    clinicLocal,
    compareLocal,
    clinicOffset: offsetLabel(sourceIso, input.clinicTimezone),
    compareOffset: offsetLabel(sourceIso, input.compareTimezone),
    dstNote,
    errors: [],
  };
}
