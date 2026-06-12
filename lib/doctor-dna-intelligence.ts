import type {
  DoctorDnaPatternItem,
  DoctorDnaPracticeMetrics,
  DoctorDnaProfile,
} from "@/lib/types/doctor-dna";

export type TrendDirection = "up" | "stable" | "down";

export type ActivityNarrativeLine = {
  id: string;
  value: number;
  text: string;
};

export type DominantDiagnosisLine = {
  id: string;
  code: string | null;
  label: string;
  display: string;
};

export type MedicationLine = {
  id: string;
  label: string;
};

export type ClinicalProfileSummary = {
  predominance: string;
  mainArea: string;
  complexity: string;
};

export type TrendLine = {
  id: string;
  direction: TrendDirection;
  label: string;
};

export type DoctorDnaIntelligenceView = {
  activity: ActivityNarrativeLine[];
  dominantDiagnoses: DominantDiagnosisLine[];
  topMedications: MedicationLine[];
  clinicalProfile: ClinicalProfileSummary;
  trends: TrendLine[];
};

const CHRONIC_CODE_PREFIXES = [
  "E10",
  "E11",
  "E78",
  "I10",
  "I11",
  "I25",
  "J44",
  "J45",
  "N18",
  "F32",
  "F41",
];

const RESPIRATORY_PREFIXES = ["J"];
const METABOLIC_PREFIXES = ["E10", "E11", "E78", "E66"];
const CARDIOVASCULAR_PREFIXES = ["I10", "I11", "I20", "I25"];

function matchesAnyPrefix(code: string | null | undefined, prefixes: string[]): boolean {
  const c = code?.trim().toUpperCase() ?? "";
  return prefixes.some((p) => c.startsWith(p));
}

function isChronicCode(code: string | null | undefined): boolean {
  const c = code?.trim().toUpperCase() ?? "";
  return CHRONIC_CODE_PREFIXES.some((p) => c.startsWith(p));
}

function formatDiagnosisDisplay(code: string | null | undefined, label: string): string {
  const trimmed = label.trim();
  if (code?.trim()) {
    const c = code.trim();
    if (trimmed.toUpperCase().startsWith(c.toUpperCase())) return trimmed;
    return `${c} ${trimmed}`;
  }
  return trimmed;
}

function daysSince(iso: string, ref = Date.now()): number {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 999;
  return Math.max(0, (ref - t) / 86_400_000);
}

export function buildActivityNarrative(
  metrics: DoctorDnaPracticeMetrics,
): ActivityNarrativeLine[] {
  const { consultations30d, uniquePatients30d, prescriptions30d, labOrders30d } =
    metrics;

  const consultWord = consultations30d === 1 ? "consulta" : "consultas";
  const patientWord = uniquePatients30d === 1 ? "paciente activo" : "pacientes activos";
  const rxWord = prescriptions30d === 1 ? "receta emitida" : "recetas emitidas";
  const labWord =
    labOrders30d === 1 ? "laboratorio solicitado" : "laboratorios solicitados";

  return [
    {
      id: "consultations",
      value: consultations30d,
      text: `${consultations30d} ${consultWord} últimos 30 días`,
    },
    {
      id: "patients",
      value: uniquePatients30d,
      text: `${uniquePatients30d} ${patientWord}`,
    },
    {
      id: "prescriptions",
      value: prescriptions30d,
      text: `${prescriptions30d} ${rxWord}`,
    },
    {
      id: "labs",
      value: labOrders30d,
      text: `${labOrders30d} ${labWord}`,
    },
  ];
}

export function buildDominantDiagnoses(
  items: DoctorDnaPatternItem[],
  limit = 5,
): DominantDiagnosisLine[] {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    code: item.code ?? null,
    label: item.label,
    display: formatDiagnosisDisplay(item.code, item.label),
  }));
}

export function buildTopMedications(
  items: DoctorDnaPatternItem[],
  limit = 5,
): MedicationLine[] {
  return items.slice(0, limit).map((item) => ({
    id: item.id,
    label: item.label,
  }));
}

export function inferMainClinicalArea(
  diagnoses: DoctorDnaPatternItem[],
): string {
  const top = diagnoses[0];
  if (!top) return "Sin área dominante aún";

  if (matchesAnyPrefix(top.code, METABOLIC_PREFIXES)) {
    return "Control metabólico";
  }
  if (matchesAnyPrefix(top.code, CARDIOVASCULAR_PREFIXES)) {
    return "Cardiovascular";
  }
  if (matchesAnyPrefix(top.code, RESPIRATORY_PREFIXES)) {
    return "Patología respiratoria";
  }
  if (matchesAnyPrefix(top.code, ["N18", "N17"])) {
    return "Función renal";
  }
  if (matchesAnyPrefix(top.code, ["F32", "F41", "F33"])) {
    return "Salud mental";
  }

  return top.label.length > 40 ? "Medicina general" : top.label;
}

export function inferPredominance(
  diagnoses: DoctorDnaPatternItem[],
  metrics: DoctorDnaPracticeMetrics,
): string {
  if (diagnoses.length === 0) return "Práctica en consolidación";

  const chronicCount = diagnoses.filter((d) => isChronicCode(d.code)).length;
  const chronicRatio = chronicCount / diagnoses.length;

  if (chronicRatio >= 0.5 || chronicCount >= 2) {
    return "Enfermedad crónica";
  }
  if (metrics.prescriptions30d > metrics.consultations30d * 0.6) {
    return "Manejo farmacológico frecuente";
  }
  if (metrics.consultations30d > 20) {
    return "Alta rotación ambulatoria";
  }
  return "Patología aguda y mixta";
}

export function inferComplexity(
  diagnoses: DoctorDnaPatternItem[],
  metrics: DoctorDnaPracticeMetrics,
): string {
  const distinctDx = diagnoses.length;
  const patients = Math.max(metrics.uniquePatients30d, 1);
  const consultsPerPatient = metrics.consultations30d / patients;

  if (distinctDx >= 5 || consultsPerPatient > 4) {
    return "Moderada a alta";
  }
  if (distinctDx >= 3 || metrics.consultations30d > 15) {
    return "Baja a moderada";
  }
  return "Baja";
}

export function buildClinicalProfile(data: DoctorDnaProfile): ClinicalProfileSummary {
  return {
    predominance: inferPredominance(data.topDiagnoses, data.practiceMetrics),
    mainArea: inferMainClinicalArea(data.topDiagnoses),
    complexity: inferComplexity(data.topDiagnoses, data.practiceMetrics),
  };
}

export function inferTrendDirection(
  item: DoctorDnaPatternItem,
  rank: number,
  ref = Date.now(),
): TrendDirection {
  const recencyDays = daysSince(item.lastUsedAt, ref);
  const score = item.preferenceScore;

  if (rank === 0 && (score >= 0.55 || item.frequency >= 4)) return "up";
  if (recencyDays <= 10 && item.frequency >= 3) return "up";
  if (recencyDays > 25 && rank >= 2) return "down";
  if (score < 0.35 && rank >= 2) return "down";
  return "stable";
}

export function buildTrendLines(
  diagnoses: DoctorDnaPatternItem[],
  limit = 4,
): TrendLine[] {
  return diagnoses.slice(0, limit).map((item, rank) => ({
    id: item.id,
    direction: inferTrendDirection(item, rank),
    label: item.label,
  }));
}

export function buildDoctorDnaIntelligenceView(
  data: DoctorDnaProfile,
): DoctorDnaIntelligenceView {
  return {
    activity: buildActivityNarrative(data.practiceMetrics),
    dominantDiagnoses: buildDominantDiagnoses(data.topDiagnoses),
    topMedications: buildTopMedications(data.topMedications),
    clinicalProfile: buildClinicalProfile(data),
    trends: buildTrendLines(data.topDiagnoses),
  };
}

export const TREND_SYMBOL: Record<TrendDirection, string> = {
  up: "↑",
  stable: "→",
  down: "↓",
};
