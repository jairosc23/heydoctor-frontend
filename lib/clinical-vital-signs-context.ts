/**
 * Phase 4.5.2 — ClinicalVitalSignsContext™
 *
 * Auditoría (2026-06): no existen columnas backend ni campos UI dedicados para
 * signos vitales. Fuentes actuales:
 * - Bloque serializado `[[HD_VS_V1]]` en `notes` (médico / integraciones futuras)
 * - Texto libre ingresado por el médico en notas o plan (extracción conservadora)
 *
 * NO se inventan valores: solo datos explícitos o parseados del texto documentado.
 */

export type ClinicalVitalSigns = {
  systolic?: number | null;
  diastolic?: number | null;
  heartRate?: number | null;
  respiratoryRate?: number | null;
  temperatureC?: number | null;
  oxygenSaturation?: number | null;
  weightKg?: number | null;
  heightCm?: number | null;
  bmi?: number | null;
};

export type ClinicalVitalSignsSource =
  | "structured_marker"
  | "free_text"
  | "none";

export type ClinicalVitalSignsContext = {
  vitals: ClinicalVitalSigns;
  source: ClinicalVitalSignsSource;
  hasData: boolean;
};

export const VITAL_SIGNS_MARKER = "[[HD_VS_V1]]";
export const VITAL_SIGNS_END = "[[/HD_VS_V1]]";

export const VITAL_SIGNS_STORAGE_AUDIT = {
  backendColumns: false,
  dedicatedUi: false,
  notesMarker: true,
  freeTextExtraction: true,
  fields: [
    "systolic",
    "diastolic",
    "heartRate",
    "respiratoryRate",
    "temperatureC",
    "oxygenSaturation",
    "weightKg",
    "heightCm",
    "bmi",
  ] as const,
} as const;

const EMPTY_VITALS: ClinicalVitalSigns = {};

type PersistedVitals = {
  v: 1;
  systolic?: number;
  diastolic?: number;
  heartRate?: number;
  respiratoryRate?: number;
  temperatureC?: number;
  oxygenSaturation?: number;
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
};

function safeParseJson(s: string): PersistedVitals | null {
  try {
    const parsed = JSON.parse(s) as PersistedVitals;
    if (parsed && typeof parsed === "object" && parsed.v === 1) return parsed;
    return null;
  } catch {
    return null;
  }
}

function finiteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function normalizeHeightToCm(value: number): number | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  return value <= 3 ? round1(value * 100) : value;
}

export type NormalizeClinicalVitalSignsOptions = {
  /**
   * Cuando true (default), convierte talla en metros (≤3) a cm.
   * Desactivar durante digitación; activar en blur / persistencia.
   */
  convertHeightMetersToCm?: boolean;
};

/** IMC con peso en kg y talla aceptando centímetros (160) o metros (1.60). */
export function computeBmi(weightKg: number, heightCmOrM: number): number | null {
  if (!Number.isFinite(weightKg) || weightKg <= 0) return null;
  if (!Number.isFinite(heightCmOrM) || heightCmOrM <= 0) return null;
  const heightM = heightCmOrM > 10 ? heightCmOrM / 100 : heightCmOrM;
  if (!Number.isFinite(heightM) || heightM <= 0) return null;
  const bmi = weightKg / (heightM * heightM);
  return Number.isFinite(bmi) ? round1(bmi) : null;
}

export function normalizeClinicalVitalSigns(
  raw: ClinicalVitalSigns,
  options?: NormalizeClinicalVitalSignsOptions,
): ClinicalVitalSigns {
  const convertHeight = options?.convertHeightMetersToCm !== false;
  const heightRaw = finiteNumber(raw.heightCm);
  const vitals: ClinicalVitalSigns = {
    systolic: finiteNumber(raw.systolic),
    diastolic: finiteNumber(raw.diastolic),
    heartRate: finiteNumber(raw.heartRate),
    respiratoryRate: finiteNumber(raw.respiratoryRate),
    temperatureC: finiteNumber(raw.temperatureC),
    oxygenSaturation: finiteNumber(raw.oxygenSaturation),
    weightKg: finiteNumber(raw.weightKg),
    heightCm:
      heightRaw != null
        ? convertHeight
          ? normalizeHeightToCm(heightRaw)
          : heightRaw
        : null,
    bmi: null,
  };

  if (vitals.weightKg != null && vitals.heightCm != null) {
    vitals.bmi = computeBmi(vitals.weightKg, vitals.heightCm);
  } else {
    vitals.bmi = finiteNumber(raw.bmi);
  }

  return vitals;
}

export function hasClinicalVitalSignsData(vitals: ClinicalVitalSigns): boolean {
  return Object.values(normalizeClinicalVitalSigns(vitals)).some(
    (v) => v != null,
  );
}

function parseMarkerBlock(notes: string): ClinicalVitalSigns | null {
  const start = notes.indexOf(VITAL_SIGNS_MARKER);
  if (start === -1) return null;
  const end = notes.indexOf(VITAL_SIGNS_END, start);
  const jsonPart =
    end >= 0
      ? notes.slice(start + VITAL_SIGNS_MARKER.length, end).trim()
      : notes.slice(start + VITAL_SIGNS_MARKER.length).trim();
  const parsed = safeParseJson(jsonPart);
  if (!parsed) return null;
  return normalizeClinicalVitalSigns(parsed);
}

function extractInt(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern);
  if (!m?.[1]) return null;
  const n = Number.parseInt(m[1], 10);
  return Number.isFinite(n) ? n : null;
}

function extractFloat(text: string, pattern: RegExp): number | null {
  const m = text.match(pattern);
  if (!m?.[1]) return null;
  const n = Number.parseFloat(m[1].replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/**
 * Extracción conservadora de vitales desde texto libre del médico.
 * Solo captura patrones explícitos; no infiere valores clínicos.
 */
export function extractVitalSignsFromText(
  text: string | null | undefined,
): ClinicalVitalSigns {
  if (!text?.trim()) return { ...EMPTY_VITALS };

  const t = text.trim();
  const out: ClinicalVitalSigns = {};

  const bp =
    t.match(
      /(?:PA|TA|presi[oó]n\s+arterial)\s*[:\s]*(\d{2,3})\s*\/\s*(\d{2,3})/i,
    ) ?? t.match(/\b(\d{2,3})\s*\/\s*(\d{2,3})\s*mm\s*Hg\b/i);
  if (bp) {
    out.systolic = Number.parseInt(bp[1]!, 10);
    out.diastolic = Number.parseInt(bp[2]!, 10);
  }

  out.heartRate =
    extractInt(t, /\bFC\s*[:\s]*(\d{2,3})\b/i) ??
    extractInt(t, /\bfrecuencia\s+card[ií]aca\s*[:\s]*(\d{2,3})\b/i);

  out.respiratoryRate =
    extractInt(t, /\bFR\s*[:\s]*(\d{1,2})\b/i) ??
    extractInt(t, /\bfrecuencia\s+respiratoria\s*[:\s]*(\d{1,2})\b/i);

  out.temperatureC =
    extractFloat(t, /\btemp(?:eratura)?\s*[:\s]*(\d{1,2}(?:[.,]\d)?)\s*°?\s*C\b/i) ??
    extractFloat(t, /\b(\d{1,2}[.,]\d)\s*°C\b/i);

  out.oxygenSaturation =
    extractInt(t, /\b(?:Sat\s*O2|SpO2|Saturaci[oó]n)\s*[:\s]*(\d{2,3})\s*%?\b/i);

  out.weightKg =
    extractFloat(t, /\bpeso\s*[:\s]*(\d{2,3}(?:[.,]\d)?)\s*kg\b/i) ??
    extractFloat(t, /\b(\d{2,3}(?:[.,]\d)?)\s*kg\b/i);

  const heightCm =
    extractFloat(t, /\btalla\s*[:\s]*(\d{2,3}(?:[.,]\d)?)\s*cm\b/i) ??
    extractFloat(t, /\b(\d{2,3})\s*cm\b/i);
  if (heightCm != null) out.heightCm = heightCm;

  const heightM = extractFloat(t, /\btalla\s*[:\s]*(\d[.,]\d{1,2})\s*m\b/i);
  if (heightM != null && out.heightCm == null) {
    out.heightCm = round1(heightM * 100);
  }

  out.bmi = extractFloat(t, /\bIMC\s*[:\s]*(\d{1,2}(?:[.,]\d)?)\b/i);

  return normalizeClinicalVitalSigns(out);
}

export function mergeClinicalVitalSigns(
  ...sources: Array<ClinicalVitalSigns | null | undefined>
): ClinicalVitalSigns {
  const merged: ClinicalVitalSigns = {};
  for (const src of sources) {
    if (!src) continue;
    for (const [key, value] of Object.entries(src) as Array<
      [keyof ClinicalVitalSigns, number | null | undefined]
    >) {
      if (value != null && merged[key] == null) {
        merged[key] = value;
      }
    }
  }
  return normalizeClinicalVitalSigns(merged);
}

export function parseClinicalVitalSignsFromNotes(
  notes: string | null | undefined,
  extraText?: string | null,
): ClinicalVitalSignsContext {
  const fromMarker = notes ? parseMarkerBlock(notes) : null;
  if (fromMarker && hasClinicalVitalSignsData(fromMarker)) {
    return {
      vitals: fromMarker,
      source: "structured_marker",
      hasData: true,
    };
  }

  const fromText = mergeClinicalVitalSigns(
    extractVitalSignsFromText(notes),
    extractVitalSignsFromText(extraText),
  );

  if (hasClinicalVitalSignsData(fromText)) {
    return { vitals: fromText, source: "free_text", hasData: true };
  }

  return { vitals: { ...EMPTY_VITALS }, source: "none", hasData: false };
}

export function serializeClinicalVitalSigns(
  vitals: ClinicalVitalSigns,
): string | null {
  const normalized = normalizeClinicalVitalSigns(vitals);
  if (!hasClinicalVitalSignsData(normalized)) return null;

  const payload: PersistedVitals = { v: 1 };
  for (const key of VITAL_SIGNS_STORAGE_AUDIT.fields) {
    const value = normalized[key];
    if (value != null) {
      (payload as Record<string, number>)[key] = value;
    }
  }

  return `${VITAL_SIGNS_MARKER}\n${JSON.stringify(payload)}\n${VITAL_SIGNS_END}`;
}

export function formatClinicalVitalSignsForContext(
  ctx: ClinicalVitalSignsContext,
): string | null {
  if (!ctx.hasData) return null;

  const v = ctx.vitals;
  const parts: string[] = [];

  if (v.systolic != null && v.diastolic != null) {
    parts.push(`PA ${v.systolic}/${v.diastolic} mmHg`);
  }
  if (v.heartRate != null) parts.push(`FC ${v.heartRate} lpm`);
  if (v.respiratoryRate != null) parts.push(`FR ${v.respiratoryRate} rpm`);
  if (v.temperatureC != null) parts.push(`Temp ${v.temperatureC} °C`);
  if (v.oxygenSaturation != null) parts.push(`SatO2 ${v.oxygenSaturation}%`);
  if (v.weightKg != null) parts.push(`Peso ${v.weightKg} kg`);
  if (v.heightCm != null) parts.push(`Talla ${v.heightCm} cm`);
  if (v.bmi != null) parts.push(`IMC ${v.bmi}`);

  if (parts.length === 0) return null;
  return `Signos vitales: ${parts.join("; ")}.`;
}
