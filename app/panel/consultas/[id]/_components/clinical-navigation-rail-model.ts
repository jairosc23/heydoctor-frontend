import { hasClinicalVitalSignsData } from "@/lib/clinical-vital-signs-context";
import { hasPhysicalExamData } from "@/lib/physical-exam-framework";
import type { PatientProfile } from "@/lib/services/patients";
import type { ClinicalEncounterChartProps } from "./chart/ClinicalEncounterChart";

export type ClinicalNavigationGroup = "context" | "documentation" | "closure";
export type ClinicalNavigationCompletion =
  | "empty"
  | "in_progress"
  | "completed"
  | "warning"
  | "blocked";
export type ClinicalNavigationRisk = "critical" | "warning" | "info";

export type ClinicalNavigationValidationCode =
  | "missing_patient"
  | "missing_anamnesis"
  | "missing_diagnosis"
  | "missing_treatment"
  | "missing_signature_prerequisites"
  | "missing_documentation";

export interface ClinicalNavigationValidationIssue {
  code: ClinicalNavigationValidationCode;
  sectionId: string;
  label: string;
  risk: ClinicalNavigationRisk;
}

export interface ClinicalNavigationSection {
  id: string;
  sectionNumber: number;
  label: string;
  shortLabel: string;
  group: ClinicalNavigationGroup;
  completion: ClinicalNavigationCompletion;
  risk?: ClinicalNavigationRisk;
  validationCode?: ClinicalNavigationValidationCode;
  helperText?: string;
  required?: boolean;
}

export interface ClinicalNavigationProgress {
  totalSections: number;
  completedSections: number;
  pendingSections: number;
  completionPercentage: number;
  signatureReady: boolean;
  criticalPendingSections: number;
}

export interface ClinicalNavigationIntelligence {
  sections: ClinicalNavigationSection[];
  progress: ClinicalNavigationProgress;
  validationIssues: ClinicalNavigationValidationIssue[];
}

const NAVIGATION_GROUP_LABELS: Record<ClinicalNavigationGroup, string> = {
  context: "Contexto",
  documentation: "Documentación",
  closure: "Cierre",
};

export function clinicalNavigationGroupLabel(
  group: ClinicalNavigationGroup,
): string {
  return NAVIGATION_GROUP_LABELS[group];
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasProfileContent(profile: PatientProfile | null | undefined): boolean {
  if (!profile) return false;
  return Boolean(
    profile.chronicConditions?.length ||
      profile.surgeries?.length ||
      profile.allergies?.length ||
      profile.medications?.length ||
      profile.disabilities?.length ||
      profile.familyHistory?.length ||
      profile.alerts?.length ||
      profile.clinicalWarnings?.length ||
      hasText(profile.smokingStatus) ||
      hasText(profile.alcoholUse) ||
      hasText(profile.drugUse) ||
      hasText(profile.exerciseFrequency) ||
      hasText(profile.notes),
  );
}

function issue(
  code: ClinicalNavigationValidationCode,
  sectionId: string,
  label: string,
  risk: ClinicalNavigationRisk,
): ClinicalNavigationValidationIssue {
  return { code, sectionId, label, risk };
}

function buildProgress(
  sections: ClinicalNavigationSection[],
  signatureReady: boolean,
): ClinicalNavigationProgress {
  const completedSections = sections.filter(
    (section) => section.completion === "completed",
  ).length;
  const criticalPendingSections = sections.filter(
    (section) =>
      section.completion !== "completed" && section.risk === "critical",
  ).length;

  return {
    totalSections: sections.length,
    completedSections,
    pendingSections: sections.length - completedSections,
    completionPercentage:
      sections.length > 0 ? Math.round((completedSections / sections.length) * 100) : 0,
    signatureReady,
    criticalPendingSections,
  };
}

export function buildClinicalNavigationIntelligence(
  chart: ClinicalEncounterChartProps,
): ClinicalNavigationIntelligence {
  const hasPatient = Boolean(chart.patientId);
  const hasDiagnosis = Boolean(
    chart.diagnosisCode?.trim() ||
      chart.diagnosisDescription?.trim() ||
      chart.diagnosis?.trim(),
  );
  const hasAnamnesis = hasText(chart.presentIllnessHistory);
  const hasTreatment = hasText(chart.treatment);
  const activeProblemsCount = chart.clinicalMemory?.activeConditions.length ?? 0;
  const signedOrLocked =
    chart.closure?.status === "signed" || chart.closure?.status === "locked";
  const profileLoading = Boolean(chart.longitudinal?.loading);
  const profileHasContent = hasProfileContent(chart.longitudinal?.profile);
  const signaturePrerequisitesReady =
    hasPatient && hasAnamnesis && hasDiagnosis && hasTreatment;
  const signatureReady =
    signedOrLocked || (signaturePrerequisitesReady && Boolean(chart.closure?.canSign));
  const validationIssues: ClinicalNavigationValidationIssue[] = [];

  if (!hasPatient) {
    validationIssues.push(
      issue("missing_patient", "encounter-section-1", "Falta paciente asociado", "critical"),
    );
  }
  if (!hasAnamnesis) {
    validationIssues.push(
      issue(
        "missing_anamnesis",
        "encounter-section-3",
        "Anamnesis pendiente",
        "warning",
      ),
    );
  }
  if (!hasDiagnosis) {
    validationIssues.push(
      issue(
        "missing_diagnosis",
        "encounter-section-11",
        "Diagnóstico requerido",
        "warning",
      ),
    );
  }
  if (!hasTreatment) {
    validationIssues.push(
      issue(
        "missing_treatment",
        "encounter-section-13",
        "Tratamiento pendiente",
        "warning",
      ),
    );
  }
  if (!signedOrLocked && !signaturePrerequisitesReady) {
    validationIssues.push(
      issue(
        "missing_signature_prerequisites",
        "encounter-section-20",
        "Firma bloqueada por documentación incompleta",
        "critical",
      ),
    );
  }
  if (!signedOrLocked) {
    validationIssues.push(
      issue(
        "missing_documentation",
        "encounter-section-22",
        "Documentos disponibles tras la firma",
        "info",
      ),
    );
  }

  const sections: ClinicalNavigationSection[] = [
    {
      id: "encounter-section-1",
      sectionNumber: 1,
      label: "Identificación",
      shortLabel: "ID",
      group: "context",
      completion: hasPatient ? "completed" : "blocked",
      risk: hasPatient ? undefined : "critical",
      validationCode: hasPatient ? undefined : "missing_patient",
      helperText: hasPatient ? "Paciente identificado" : "Falta paciente asociado",
      required: true,
    },
    {
      id: "encounter-section-4",
      sectionNumber: 4,
      label: "Antecedentes",
      shortLabel: "Ant.",
      group: "context",
      completion: profileLoading
        ? "in_progress"
        : profileHasContent
          ? "completed"
          : "empty",
      risk: profileHasContent || profileLoading ? undefined : "info",
      helperText: profileHasContent
        ? "Antecedentes longitudinales disponibles"
        : profileLoading
          ? "Cargando antecedentes"
          : "Sin antecedentes longitudinales registrados",
    },
    {
      id: "encounter-section-3",
      sectionNumber: 3,
      label: "Anamnesis",
      shortLabel: "Anam.",
      group: "documentation",
      completion: hasAnamnesis ? "completed" : "warning",
      risk: hasAnamnesis ? undefined : "warning",
      validationCode: hasAnamnesis ? undefined : "missing_anamnesis",
      helperText: hasAnamnesis ? "Motivo e historia documentados" : "Anamnesis pendiente",
      required: true,
    },
    {
      id: "encounter-section-9",
      sectionNumber: 9,
      label: "Signos vitales",
      shortLabel: "Vitales",
      group: "documentation",
      completion: hasClinicalVitalSignsData(chart.vitals)
        ? "completed"
        : "empty",
      risk: hasClinicalVitalSignsData(chart.vitals) ? undefined : "info",
      helperText: hasClinicalVitalSignsData(chart.vitals)
        ? "Signos vitales documentados"
        : "Sin signos vitales registrados",
    },
    {
      id: "encounter-section-10",
      sectionNumber: 10,
      label: "Examen físico",
      shortLabel: "Ex. físico",
      group: "documentation",
      completion: hasPhysicalExamData(chart.physicalExam)
        ? "completed"
        : "empty",
      risk: hasPhysicalExamData(chart.physicalExam) ? undefined : "info",
      helperText: hasPhysicalExamData(chart.physicalExam)
        ? "Examen físico documentado"
        : "Sin examen físico registrado",
    },
    {
      id: "encounter-section-11",
      sectionNumber: 11,
      label: "Diagnósticos",
      shortLabel: "Dx",
      group: "documentation",
      completion: hasDiagnosis ? "completed" : "warning",
      risk: hasDiagnosis ? undefined : "warning",
      validationCode: hasDiagnosis ? undefined : "missing_diagnosis",
      helperText: hasDiagnosis ? "Diagnóstico principal registrado" : "Diagnóstico requerido",
      required: true,
    },
    {
      id: "encounter-section-12",
      sectionNumber: 12,
      label: "Problemas activos",
      shortLabel: "Problemas",
      group: "documentation",
      completion: activeProblemsCount > 0 ? "completed" : "empty",
      risk: activeProblemsCount > 0 ? undefined : "info",
      helperText:
        activeProblemsCount > 0
          ? `${activeProblemsCount} problema(s) activo(s)`
          : "Sin problemas activos registrados",
    },
    {
      id: "encounter-section-13",
      sectionNumber: 13,
      label: "Tratamiento",
      shortLabel: "Plan",
      group: "documentation",
      completion: hasTreatment ? "completed" : "warning",
      risk: hasTreatment ? undefined : "warning",
      validationCode: hasTreatment ? undefined : "missing_treatment",
      helperText: hasTreatment ? "Plan terapéutico registrado" : "Tratamiento pendiente",
      required: true,
    },
    {
      id: "encounter-section-20",
      sectionNumber: 20,
      label: "Firma",
      shortLabel: "Firma",
      group: "closure",
      completion: signedOrLocked
        ? "completed"
        : signatureReady
          ? "in_progress"
          : "blocked",
      risk: signedOrLocked || signatureReady ? undefined : "critical",
      validationCode:
        signedOrLocked || signatureReady
          ? undefined
          : "missing_signature_prerequisites",
      helperText: signedOrLocked
        ? "Consulta firmada o bloqueada"
        : signatureReady
          ? "Lista para firma médica"
          : "Complete diagnóstico, tratamiento y documentación clínica",
      required: true,
    },
    {
      id: "encounter-section-22",
      sectionNumber: 22,
      label: "Documentos",
      shortLabel: "Docs",
      group: "closure",
      completion: signedOrLocked ? "completed" : "blocked",
      risk: signedOrLocked ? undefined : "info",
      validationCode: signedOrLocked ? undefined : "missing_documentation",
      helperText: signedOrLocked
        ? "Documentos clínicos habilitados"
        : "Disponibles tras la firma médica",
    },
  ];

  return {
    sections,
    progress: buildProgress(sections, signatureReady),
    validationIssues,
  };
}

export function buildClinicalNavigationSections(
  chart: ClinicalEncounterChartProps,
): ClinicalNavigationSection[] {
  return buildClinicalNavigationIntelligence(chart).sections;
}
