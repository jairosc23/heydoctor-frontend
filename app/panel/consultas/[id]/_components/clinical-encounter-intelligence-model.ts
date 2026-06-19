import { jsonLinesToList } from "@/lib/patient-profile-display";
import type { NestConsultation } from "@/lib/services/consultations";
import type { PatientProfile } from "@/lib/services/patients";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import type {
  ClinicalNavigationIntelligence,
  ClinicalNavigationRisk,
  ClinicalNavigationValidationIssue,
} from "./clinical-navigation-rail-model";

export type ClinicalEncounterIntelligenceSeverity =
  | "critical"
  | "warning"
  | "info";

export type ClinicalEncounterIntelligenceKind =
  | "clinical_risk"
  | "missing_documentation"
  | "signature_readiness"
  | "longitudinal_insight"
  | "informational_context";

export interface ClinicalEncounterTimelineEvent {
  id?: string;
  type?: string | null;
  label?: string | null;
  diagnosisLabel?: string | null;
  diagnosisCode?: string | null;
  occurredAt?: string | null;
  createdAt?: string | null;
}

export interface ClinicalEncounterIntelligenceInput {
  consultation: NestConsultation;
  patientProfile: PatientProfile | null | undefined;
  clinicalMemory: PatientClinicalMemory | null | undefined;
  timeline: ClinicalEncounterTimelineEvent[];
  navigationIntelligence: ClinicalNavigationIntelligence;
}

export interface ClinicalEncounterSignal {
  id: string;
  kind: ClinicalEncounterIntelligenceKind;
  severity: ClinicalEncounterIntelligenceSeverity;
  title: string;
  detail: string;
  source:
    | "navigation"
    | "patient_profile"
    | "clinical_memory"
    | "timeline";
  sectionId?: string;
}

export interface ClinicalEncounterIntelligenceModel {
  topSignals: ClinicalEncounterSignal[];
  warnings: ClinicalEncounterSignal[];
  insights: ClinicalEncounterSignal[];
  informational: ClinicalEncounterSignal[];
  sourceCounts: {
    navigationIssues: number;
    allergies: number;
    activeMedications: number;
    recurrentProblems: number;
    recurrentConsultations: number;
    recentChanges: number;
  };
  sourceOfTruth: {
    completionPercentage: number;
    completedSections: number;
    pendingSections: number;
    signatureReady: boolean;
    documentationIssues: ClinicalNavigationValidationIssue[];
  };
}

const MAX_TOP_SIGNALS = 3;

function severityFromNavigationRisk(
  risk: ClinicalNavigationRisk,
): ClinicalEncounterIntelligenceSeverity {
  if (risk === "critical") return "critical";
  if (risk === "warning") return "warning";
  return "info";
}

function priority(kind: ClinicalEncounterIntelligenceKind): number {
  if (kind === "clinical_risk") return 1;
  if (kind === "missing_documentation") return 2;
  if (kind === "signature_readiness") return 3;
  if (kind === "longitudinal_insight") return 4;
  return 5;
}

function severityRank(severity: ClinicalEncounterIntelligenceSeverity): number {
  if (severity === "critical") return 1;
  if (severity === "warning") return 2;
  return 3;
}

function sortSignals(signals: ClinicalEncounterSignal[]): ClinicalEncounterSignal[] {
  return [...signals].sort((a, b) => {
    const priorityDelta = priority(a.kind) - priority(b.kind);
    if (priorityDelta !== 0) return priorityDelta;
    const severityDelta = severityRank(a.severity) - severityRank(b.severity);
    if (severityDelta !== 0) return severityDelta;
    return a.title.localeCompare(b.title, "es");
  });
}

function dedupeSignals(signals: ClinicalEncounterSignal[]): ClinicalEncounterSignal[] {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = `${signal.kind}:${signal.severity}:${signal.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildDocumentationSignals(
  issues: ClinicalNavigationValidationIssue[],
): ClinicalEncounterSignal[] {
  return issues.map((issue) => ({
    id: `nav-${issue.code}`,
    kind: issue.code === "missing_documentation"
      ? "informational_context"
      : "missing_documentation",
    severity: severityFromNavigationRisk(issue.risk),
    title: issue.label,
    detail: "Derivado de Navigation Intelligence; P2 no recalcula esta regla.",
    source: "navigation",
    sectionId: issue.sectionId,
  }));
}

function buildSignatureSignal(
  navigationIntelligence: ClinicalNavigationIntelligence,
): ClinicalEncounterSignal | null {
  const signatureSection = navigationIntelligence.sections.find(
    (section) => section.id === "encounter-section-20",
  );
  const signed = signatureSection?.completion === "completed";
  if (signed) return null;

  return {
    id: "signature-readiness",
    kind: "signature_readiness",
    severity: navigationIntelligence.progress.signatureReady ? "info" : "warning",
    title: navigationIntelligence.progress.signatureReady
      ? "Firma médica lista"
      : "Firma médica pendiente",
    detail: "Usa `navigationIntelligence.progress.signatureReady` como única fuente de verdad.",
    source: "navigation",
    sectionId: "encounter-section-20",
  };
}

function buildAllergySignals(
  patientProfile: PatientProfile | null | undefined,
): ClinicalEncounterSignal[] {
  const allergyLines = jsonLinesToList(patientProfile?.allergies).slice(0, 3);
  if (allergyLines.length === 0) return [];
  return [
    {
      id: "allergy-documented",
      kind: "clinical_risk",
      severity: "critical",
      title: "Alergia documentada",
      detail: allergyLines.join(" · "),
      source: "patient_profile",
    },
  ];
}

function hasClinicalWarning(
  patientProfile: PatientProfile | null | undefined,
  clinicalMemory: PatientClinicalMemory | null | undefined,
): boolean {
  const profileWarnings = jsonLinesToList(patientProfile?.clinicalWarnings);
  return Boolean(
    profileWarnings.length ||
      clinicalMemory?.alerts.some(
        (alert) => alert.severity === "critical" || alert.severity === "warning",
      ),
  );
}

function buildMedicationSignal(
  patientProfile: PatientProfile | null | undefined,
  clinicalMemory: PatientClinicalMemory | null | undefined,
): ClinicalEncounterSignal | null {
  const medications = clinicalMemory?.currentMedications ?? [];
  if (medications.length === 0) return null;
  const hasCondition = Boolean(clinicalMemory?.activeConditions.length);
  const severity: ClinicalEncounterIntelligenceSeverity =
    hasClinicalWarning(patientProfile, clinicalMemory) || hasCondition
      ? "warning"
      : "info";
  return {
    id: "active-medications",
    kind: "informational_context",
    severity,
    title:
      medications.length === 1
        ? "1 medicamento activo"
        : `${medications.length} medicamentos activos`,
    detail: medications
      .slice(0, 3)
      .map((medication) => medication.name)
      .join(" · "),
    source: "clinical_memory",
  };
}

function normalizeLabel(value: string | null | undefined): string | null {
  const label = value?.trim();
  return label ? label.toLowerCase() : null;
}

function countOccurrences(labels: Array<string | null | undefined>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const raw of labels) {
    const label = normalizeLabel(raw);
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return counts;
}

function buildRecurrentProblemSignal(
  clinicalMemory: PatientClinicalMemory | null | undefined,
  timeline: ClinicalEncounterTimelineEvent[],
): ClinicalEncounterSignal | null {
  const labels = [
    ...(clinicalMemory?.recentDiagnoses.map((condition) => condition.label) ?? []),
    ...(clinicalMemory?.activeConditions.map((condition) => condition.label) ?? []),
    ...timeline.map((event) => event.diagnosisLabel ?? event.label ?? null),
  ];
  const recurrent = [...countOccurrences(labels).entries()].find(([, count]) => count >= 2);
  if (!recurrent) return null;
  const [label, count] = recurrent;
  return {
    id: `recurrent-problem-${label}`,
    kind: "longitudinal_insight",
    severity: "info",
    title: "Problema recurrente",
    detail: `${label} aparece ${count} veces en memoria o timeline documentado.`,
    source: clinicalMemory?.recentDiagnoses.length ? "clinical_memory" : "timeline",
  };
}

function buildRecurrentConsultationSignal(
  clinicalMemory: PatientClinicalMemory | null | undefined,
  timeline: ClinicalEncounterTimelineEvent[],
): ClinicalEncounterSignal | null {
  const consultationLabels = [
    ...(clinicalMemory?.recentConsultations.map(
      (consultation) =>
        consultation.diagnosisLabel ??
        consultation.diagnosisCode ??
        consultation.status,
    ) ?? []),
    ...timeline
      .filter((event) => /consulta|consultation/i.test(event.type ?? event.label ?? ""))
      .map((event) => event.diagnosisLabel ?? event.diagnosisCode ?? event.label),
  ];
  const recurrent = [...countOccurrences(consultationLabels).entries()].find(
    ([label, count]) => label !== "completed" && label !== "signed" && count >= 2,
  );
  if (!recurrent) return null;
  const [label, count] = recurrent;
  return {
    id: `recurrent-consultation-${label}`,
    kind: "longitudinal_insight",
    severity: "info",
    title: "Consulta recurrente",
    detail: `${label} aparece en ${count} consultas documentadas.`,
    source: clinicalMemory?.recentConsultations.length ? "clinical_memory" : "timeline",
  };
}

function buildRecentChangeSignal(
  clinicalMemory: PatientClinicalMemory | null | undefined,
  timeline: ClinicalEncounterTimelineEvent[],
): ClinicalEncounterSignal | null {
  const event = timeline.find((item) => item.label?.trim() || item.type?.trim());
  if (event) {
    return {
      id: `recent-change-${event.id ?? event.label ?? event.type}`,
      kind: "longitudinal_insight",
      severity: "info",
      title: "Cambio reciente",
      detail: event.label ?? event.type ?? "Evento reciente documentado en timeline.",
      source: "timeline",
    };
  }
  const medication = clinicalMemory?.currentMedications.find((item) => item.since);
  if (!medication) return null;
  return {
    id: `recent-medication-${medication.prescriptionId}`,
    kind: "longitudinal_insight",
    severity: "info",
    title: "Cambio reciente",
    detail: `${medication.name} activo desde ${medication.since}.`,
    source: "clinical_memory",
  };
}

export function buildClinicalEncounterIntelligence(
  input: ClinicalEncounterIntelligenceInput,
): ClinicalEncounterIntelligenceModel {
  const documentationSignals = buildDocumentationSignals(
    input.navigationIntelligence.validationIssues,
  );
  const signatureSignal = buildSignatureSignal(input.navigationIntelligence);
  const allergySignals = buildAllergySignals(input.patientProfile);
  const medicationSignal = buildMedicationSignal(
    input.patientProfile,
    input.clinicalMemory,
  );
  const recurrentProblemSignal = buildRecurrentProblemSignal(
    input.clinicalMemory,
    input.timeline,
  );
  const recurrentConsultationSignal = buildRecurrentConsultationSignal(
    input.clinicalMemory,
    input.timeline,
  );
  const recentChangeSignal = buildRecentChangeSignal(
    input.clinicalMemory,
    input.timeline,
  );

  const signals = dedupeSignals(
    [
      ...documentationSignals,
      signatureSignal,
      ...allergySignals,
      medicationSignal,
      recurrentProblemSignal,
      recurrentConsultationSignal,
      recentChangeSignal,
    ].filter((signal): signal is ClinicalEncounterSignal => Boolean(signal)),
  );
  const sortedSignals = sortSignals(signals);

  return {
    topSignals: sortedSignals.slice(0, MAX_TOP_SIGNALS),
    warnings: sortedSignals.filter(
      (signal) =>
        signal.severity === "critical" ||
        signal.severity === "warning" ||
        signal.kind === "missing_documentation",
    ),
    insights: sortedSignals.filter(
      (signal) => signal.kind === "longitudinal_insight",
    ),
    informational: sortedSignals.filter(
      (signal) => signal.kind === "informational_context",
    ),
    sourceCounts: {
      navigationIssues: input.navigationIntelligence.validationIssues.length,
      allergies: jsonLinesToList(input.patientProfile?.allergies).length,
      activeMedications: input.clinicalMemory?.currentMedications.length ?? 0,
      recurrentProblems: recurrentProblemSignal ? 1 : 0,
      recurrentConsultations: recurrentConsultationSignal ? 1 : 0,
      recentChanges: recentChangeSignal ? 1 : 0,
    },
    sourceOfTruth: {
      completionPercentage:
        input.navigationIntelligence.progress.completionPercentage,
      completedSections: input.navigationIntelligence.progress.completedSections,
      pendingSections: input.navigationIntelligence.progress.pendingSections,
      signatureReady: input.navigationIntelligence.progress.signatureReady,
      documentationIssues: input.navigationIntelligence.validationIssues,
    },
  };
}
