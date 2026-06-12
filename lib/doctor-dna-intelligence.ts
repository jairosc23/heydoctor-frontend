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

export type ClinicalSignature = {
  predominance: string;
  style: string;
  complexity: string;
  profile: string;
};

export type RankedPathology = {
  id: string;
  rank: number;
  medal: string;
  label: string;
  code: string | null;
};

export type DoctorDnaIntelligenceView = {
  signature: ClinicalSignature;
  physicianTraits: string[];
  rankedPathologies: RankedPathology[];
  frequentInterventions: string[];
  observations: string[];
  persistentChipLabel: string;
  activity: ActivityNarrativeLine[];
  dominantDiagnoses: DominantDiagnosisLine[];
  topMedications: MedicationLine[];
  clinicalProfile: ClinicalProfileSummary;
  trends: TrendLine[];
};

const RANK_MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"] as const;

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

export function inferClinicalStyle(
  data: DoctorDnaProfile,
): string {
  const { consultations30d, uniquePatients30d, prescriptions30d } =
    data.practiceMetrics;
  const patients = Math.max(uniquePatients30d, 1);
  const consultsPerPatient = consultations30d / patients;

  if (data.topFollowUps.length >= 2 || consultsPerPatient >= 2.5) {
    return "Seguimiento longitudinal";
  }
  if (prescriptions30d > consultations30d * 0.7) {
    return "Manejo terapéutico activo";
  }
  if (consultations30d > 15 && prescriptions30d < consultations30d * 0.4) {
    return "Resolución ambulatoria de episodios";
  }
  return "Consulta clínica mixta";
}

export function inferSignatureProfile(
  predominance: string,
  metrics: DoctorDnaPracticeMetrics,
): string {
  if (predominance === "Enfermedad crónica") {
    return "Atención ambulatoria crónica";
  }
  if (predominance === "Alta rotación ambulatoria") {
    return "Consulta ambulatoria de alta demanda";
  }
  if (predominance === "Manejo farmacológico frecuente") {
    return "Práctica orientada a tratamiento";
  }
  if (metrics.consultations30d < 5) {
    return "Práctica en desarrollo";
  }
  return "Atención ambulatoria general";
}

export function buildClinicalSignature(data: DoctorDnaProfile): ClinicalSignature {
  const profile = buildClinicalProfile(data);
  const predominance = profile.mainArea;
  const predominanceKind = profile.predominance;

  return {
    predominance,
    style: inferClinicalStyle(data),
    complexity: profile.complexity,
    profile: inferSignatureProfile(predominanceKind, data.practiceMetrics),
  };
}

export function buildPhysicianTraits(data: DoctorDnaProfile): string[] {
  const traits: string[] = [];
  const { consultations30d, uniquePatients30d, prescriptions30d, labOrders30d } =
    data.practiceMetrics;
  const patients = Math.max(uniquePatients30d, 1);
  const consultsPerPatient = consultations30d / patients;
  const predominance = inferPredominance(data.topDiagnoses, data.practiceMetrics);
  const complexity = inferComplexity(data.topDiagnoses, data.practiceMetrics);

  if (consultsPerPatient >= 2) {
    traits.push("Alta continuidad de seguimiento");
  }
  if (predominance === "Enfermedad crónica") {
    traits.push("Manejo frecuente de enfermedad crónica");
  }
  if (consultations30d >= 8) {
    traits.push("Predominio ambulatorio");
  }
  if (complexity === "Baja" || complexity === "Baja a moderada") {
    traits.push("Baja complejidad hospitalaria");
  }
  if (
    matchesAnyPrefix(data.topDiagnoses[0]?.code, METABOLIC_PREFIXES) ||
    labOrders30d >= 3
  ) {
    traits.push("Fuerte enfoque preventivo");
  }
  if (prescriptions30d >= 5 && traits.length < 5) {
    traits.push("Intervención farmacológica recurrente");
  }
  if (data.topFollowUps.length >= 1 && traits.length < 5) {
    traits.push("Hábito de control programado");
  }
  if (traits.length === 0) {
    traits.push("Perfil clínico aún en consolidación");
  }

  return traits.slice(0, 5);
}

export function buildRankedPathologies(
  items: DoctorDnaPatternItem[],
  limit = 5,
): RankedPathology[] {
  return items.slice(0, limit).map((item, index) => ({
    id: item.id,
    rank: index + 1,
    medal: RANK_MEDALS[index] ?? `${index + 1}.`,
    label: item.label,
    code: item.code ?? null,
  }));
}

export function buildFrequentInterventions(data: DoctorDnaProfile): string[] {
  const items: string[] = [];
  const seen = new Set<string>();

  const push = (label: string) => {
    const key = label.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    items.push(label);
  };

  for (const med of data.topMedications.slice(0, 3)) {
    push(med.label);
  }

  const predominance = inferPredominance(data.topDiagnoses, data.practiceMetrics);
  if (predominance === "Enfermedad crónica") {
    push("Educación terapéutica");
  }
  if (data.practiceMetrics.labOrders30d > 0) {
    push("Solicitud de laboratorios");
  }
  if (matchesAnyPrefix(data.topDiagnoses[0]?.code, METABOLIC_PREFIXES)) {
    push("Control metabólico");
  }
  if (data.topFollowUps.length > 0 || data.practiceMetrics.consultations30d >= 10) {
    push("Seguimiento clínico");
  }
  if (data.practiceMetrics.prescriptions30d > 0 && items.length < 5) {
    push("Prescripción farmacológica");
  }
  for (const lab of data.topLabs.slice(0, 2)) {
    if (items.length >= 6) break;
    push(lab.label);
  }

  return items.slice(0, 6);
}

export function buildDoctorDnaObservations(
  data: DoctorDnaProfile,
  signature: ClinicalSignature,
): string[] {
  const observations: string[] = [];
  const { consultations30d, uniquePatients30d, prescriptions30d } =
    data.practiceMetrics;
  const patients = Math.max(uniquePatients30d, 1);
  const consultsPerPatient = consultations30d / patients;
  const topDx = data.topDiagnoses[0]?.label;

  if (matchesAnyPrefix(data.topDiagnoses[0]?.code, METABOLIC_PREFIXES)) {
    observations.push(
      "Existe predominio de seguimiento de pacientes con enfermedad metabólica crónica.",
    );
  }
  if (consultsPerPatient >= 2.5) {
    observations.push(
      "Se identifica continuidad clínica superior al promedio de la práctica registrada.",
    );
  }
  if (
    consultations30d >= 10 &&
    inferPredominance(data.topDiagnoses, data.practiceMetrics) !== "Patología aguda y mixta"
  ) {
    observations.push(
      "La actividad reciente muestra foco en control ambulatorio más que resolución de cuadros agudos.",
    );
  }
  if (signature.style === "Seguimiento longitudinal") {
    observations.push(
      "Tu práctica sugiere un estilo de acompañamiento longitudinal más que intervención puntual.",
    );
  }
  if (prescriptions30d >= 5 && topDx) {
    observations.push(
      `Los patrones recientes asocian tu práctica con manejo farmacológico de ${topDx.toLowerCase()}.`,
    );
  }
  if (data.topDiagnoses.length >= 3) {
    observations.push(
      "Doctor DNA detecta diversidad diagnóstica con núcleo claro de patologías crónicas.",
    );
  }
  if (observations.length === 0) {
    observations.push(
      "Doctor DNA aún está consolidando tu huella clínica a partir de la actividad registrada.",
    );
  }

  return observations.slice(0, 4);
}

export function buildPersistentChipLabel(signature: ClinicalSignature): string {
  if (signature.profile.includes("crónica")) {
    return signature.profile;
  }
  if (signature.style === "Seguimiento longitudinal") {
    return "Seguimiento longitudinal";
  }
  if (signature.predominance !== "Sin área dominante aún") {
    return `${signature.predominance} predominante`;
  }
  return signature.profile;
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
  const signature = buildClinicalSignature(data);
  return {
    signature,
    physicianTraits: buildPhysicianTraits(data),
    rankedPathologies: buildRankedPathologies(data.topDiagnoses),
    frequentInterventions: buildFrequentInterventions(data),
    observations: buildDoctorDnaObservations(data, signature),
    persistentChipLabel: buildPersistentChipLabel(signature),
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
