/**
 * Deterministic clinical parsers for the Calculation Engine.
 * Only exact, documented patterns succeed; otherwise incomplete / non_deterministic.
 * No AI, no fuzzy heuristics, no inventing values from free prose.
 */

import type { ParsedDose } from "./types";

const DOSE_UNIT =
  "(?:comprimidos?|tabletas?|tabs?\\.?|c[aá]psulas?|caps?\\.?|ml|mL|mg|g|gotas?|aplicaciones?|aplicaci[oó]n|puffs?|sobres?|ampollas?)";

/** Leading numeric dose + optional unit. */
export function parseDose(raw: string): ParsedDose | null {
  const text = raw.trim().toLowerCase().normalize("NFC");
  if (!text) return null;
  const re = new RegExp(
    `^(\\d+(?:[.,]\\d+)?)\\s*(${DOSE_UNIT})?\\b`,
    "i",
  );
  const m = text.match(re);
  if (!m) return null;
  const amount = Number(m[1]!.replace(",", "."));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const unit = normalizeUnit(m[2] ?? "");
  return { amount, unit };
}

export function parseDurationDays(raw: string): number | null {
  const text = raw.trim().toLowerCase().normalize("NFC");
  if (!text) return null;
  const m = text.match(/^(\d+(?:[.,]\d+)?)\s*(?:d[ií]as?|d|day|days)?\s*$/i);
  if (!m) {
    const m2 = text.match(
      /^(\d+(?:[.,]\d+)?)\s*(?:d[ií]as?|d|day|days)\b/i,
    );
    if (!m2) return null;
    const days = Number(m2[1]!.replace(",", "."));
    return Number.isFinite(days) && days > 0 ? days : null;
  }
  const days = Number(m[1]!.replace(",", "."));
  return Number.isFinite(days) && days > 0 ? days : null;
}

export type FrequencyParse =
  | { kind: "scheduled"; dosesPerDay: number }
  | { kind: "prn" }
  | { kind: "unparseable" };

/**
 * Deterministic frequency → doses/day.
 * PRN / “según necesidad” → non-deterministic (no auto quantity).
 */
export function parseFrequency(raw: string): FrequencyParse {
  const text = raw.trim().toLowerCase().normalize("NFC");
  if (!text) return { kind: "unparseable" };

  if (isPrn(text)) return { kind: "prn" };

  // cada 8 horas · c/8 h · c/8h · every 8 hours
  const interval = text.match(
    /(?:^|\b)(?:cada|c\/|every)\s*(\d+(?:[.,]\d+)?)\s*(?:h(?:oras?)?|hrs?\.?|hours?)\b/i,
  );
  if (interval) {
    const hours = Number(interval[1]!.replace(",", "."));
    if (!Number.isFinite(hours) || hours <= 0) return { kind: "unparseable" };
    const dpd = 24 / hours;
    if (!Number.isFinite(dpd) || dpd <= 0) return { kind: "unparseable" };
    return { kind: "scheduled", dosesPerDay: dpd };
  }

  // 1-0-1 · 1-1-1 · 2-0-2 (sum of numeric slots)
  const slots = text.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*(\d+(?:[.,]\d+)?))+$/);
  if (slots || /^(\d+(?:[.,]\d+)?)(?:[-–]\d+(?:[.,]\d+)?)+$/.test(text)) {
    const parts = text.split(/[-–]/).map((p) => Number(p.trim().replace(",", ".")));
    if (parts.every((n) => Number.isFinite(n) && n >= 0)) {
      const sum = parts.reduce((a, b) => a + b, 0);
      if (sum > 0) return { kind: "scheduled", dosesPerDay: sum };
    }
  }

  // N veces al día / N veces/día
  const times = text.match(
    /^(\d+(?:[.,]\d+)?)\s*veces?(?:\s*(?:al|\/|por)\s*d[ií]a)?\s*$/i,
  );
  if (times) {
    const n = Number(times[1]!.replace(",", "."));
    if (Number.isFinite(n) && n > 0) return { kind: "scheduled", dosesPerDay: n };
  }

  // diaria / diario / 1 vez al día / qd / once daily
  if (
    /^(?:diari[oa]|diario|1\s*vez(?:\s*(?:al|\/|por)\s*d[ií]a)?|qd|once\s*daily|once\s*a\s*day)$/i.test(
      text,
    )
  ) {
    return { kind: "scheduled", dosesPerDay: 1 };
  }

  // bid / tid / qid
  if (/^(?:bid|2\s*veces(?:\s*(?:al|\/|por)\s*d[ií]a)?)$/i.test(text)) {
    return { kind: "scheduled", dosesPerDay: 2 };
  }
  if (/^(?:tid|3\s*veces(?:\s*(?:al|\/|por)\s*d[ií]a)?)$/i.test(text)) {
    return { kind: "scheduled", dosesPerDay: 3 };
  }
  if (/^(?:qid|4\s*veces(?:\s*(?:al|\/|por)\s*d[ií]a)?)$/i.test(text)) {
    return { kind: "scheduled", dosesPerDay: 4 };
  }

  return { kind: "unparseable" };
}

function isPrn(text: string): boolean {
  return (
    /^(?:prn|s\.?\s*o\.?\s*s\.?)$/i.test(text) ||
    /\bprn\b/i.test(text) ||
    /seg[uú]n\s+necesidad/i.test(text) ||
    /si\s+(?:precisa|necesita|dolor|fiebre)/i.test(text) ||
    /a\s+demanda/i.test(text)
  );
}

function normalizeUnit(raw: string): string {
  const u = raw.trim().toLowerCase().normalize("NFC");
  if (!u) return "unidad";
  if (/^comprimidos?$/.test(u)) return "comprimido";
  if (/^tabletas?$|^tabs?\.?$/.test(u)) return "tableta";
  if (/^c[aá]psulas?$|^caps?\.?$/.test(u)) return "cápsula";
  if (u === "ml") return "mL";
  if (u === "mg") return "mg";
  if (u === "g") return "g";
  if (/^gotas?$/.test(u)) return "gota";
  if (/^aplicaciones?$|^aplicaci[oó]n$/.test(u)) return "aplicación";
  if (/^puffs?$/.test(u)) return "puff";
  if (/^sobres?$/.test(u)) return "sobre";
  if (/^ampollas?$/.test(u)) return "ampolla";
  return u;
}

/** Prefer dose unit; fall back to presentation form mapping. */
export function resolveQuantityUnit(
  doseUnit: string,
  dosageForm?: string,
): string {
  if (doseUnit && doseUnit !== "unidad") return doseUnit;
  const form = (dosageForm ?? "").trim().toLowerCase().normalize("NFC");
  if (!form) return doseUnit || "unidad";
  if (/compri|tableta|tab\b/.test(form)) return "comprimido";
  if (/c[aá]psul/.test(form)) return "cápsula";
  if (/suspens|jarabe|soluci[oó]n|l[ií]quid/.test(form)) return "mL";
  if (/crema|gel|ung[uü]ento|aplic/.test(form)) return "aplicación";
  if (/gota/.test(form)) return "gota";
  return doseUnit || "unidad";
}

export function formatAmount(n: number): string {
  if (Number.isInteger(n)) return String(n);
  // Trim binary float noise for clean ratios (e.g. 24/8)
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}

export function pluralizeUnit(amount: number, unit: string): string {
  if (amount === 1) return unit;
  if (unit === "mL" || unit === "mg" || unit === "g") return unit;
  if (unit === "aplicación") return "aplicaciones";
  if (unit === "cápsula") return "cápsulas";
  if (unit === "comprimido") return "comprimidos";
  if (unit === "tableta") return "tabletas";
  if (unit === "gota") return "gotas";
  if (unit === "unidad") return "unidades";
  if (unit.endsWith("s")) return unit;
  return `${unit}s`;
}
