import { hasClinicalVitalSignsData } from "@/lib/clinical-vital-signs-context";
import { hasPhysicalExamData } from "@/lib/physical-exam-framework";
import type { PatientProfile } from "@/lib/services/patients";
import type { ClinicalEncounterChartProps } from "./chart/ClinicalEncounterChart";

export type ClinicalNavigationGroup = "context" | "documentation" | "closure";
export type ClinicalNavigationCompletion =
  | "pending"
  | "partial"
  | "complete"
  | "informational";

export interface ClinicalNavigationSection {
  id: string;
  sectionNumber: number;
  label: string;
  shortLabel: string;
  group: ClinicalNavigationGroup;
  completion: ClinicalNavigationCompletion;
  required?: boolean;
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

export function buildClinicalNavigationSections(
  chart: ClinicalEncounterChartProps,
): ClinicalNavigationSection[] {
  const hasDiagnosis = Boolean(
    chart.diagnosisCode?.trim() ||
      chart.diagnosisDescription?.trim() ||
      chart.diagnosis?.trim(),
  );
  const activeProblemsCount = chart.clinicalMemory?.activeConditions.length ?? 0;
  const signedOrLocked =
    chart.closure?.status === "signed" || chart.closure?.status === "locked";

  return [
    {
      id: "encounter-section-1",
      sectionNumber: 1,
      label: "Identificación",
      shortLabel: "ID",
      group: "context",
      completion: chart.patientId ? "complete" : "pending",
      required: true,
    },
    {
      id: "encounter-section-4",
      sectionNumber: 4,
      label: "Antecedentes",
      shortLabel: "Ant.",
      group: "context",
      completion: chart.longitudinal?.loading
        ? "partial"
        : hasProfileContent(chart.longitudinal?.profile)
          ? "complete"
          : "informational",
    },
    {
      id: "encounter-section-3",
      sectionNumber: 3,
      label: "Anamnesis",
      shortLabel: "Anam.",
      group: "documentation",
      completion: hasText(chart.presentIllnessHistory) ? "complete" : "pending",
      required: true,
    },
    {
      id: "encounter-section-9",
      sectionNumber: 9,
      label: "Signos vitales",
      shortLabel: "Vitales",
      group: "documentation",
      completion: hasClinicalVitalSignsData(chart.vitals)
        ? "complete"
        : "pending",
    },
    {
      id: "encounter-section-10",
      sectionNumber: 10,
      label: "Examen físico",
      shortLabel: "Ex. físico",
      group: "documentation",
      completion: hasPhysicalExamData(chart.physicalExam)
        ? "complete"
        : "pending",
    },
    {
      id: "encounter-section-11",
      sectionNumber: 11,
      label: "Diagnósticos",
      shortLabel: "Dx",
      group: "documentation",
      completion: hasDiagnosis ? "complete" : "pending",
      required: true,
    },
    {
      id: "encounter-section-12",
      sectionNumber: 12,
      label: "Problemas activos",
      shortLabel: "Problemas",
      group: "documentation",
      completion: activeProblemsCount > 0 ? "complete" : "informational",
    },
    {
      id: "encounter-section-13",
      sectionNumber: 13,
      label: "Tratamiento",
      shortLabel: "Plan",
      group: "documentation",
      completion: hasText(chart.treatment) ? "complete" : "pending",
      required: true,
    },
    {
      id: "encounter-section-20",
      sectionNumber: 20,
      label: "Firma",
      shortLabel: "Firma",
      group: "closure",
      completion: signedOrLocked ? "complete" : "pending",
      required: true,
    },
    {
      id: "encounter-section-22",
      sectionNumber: 22,
      label: "Documentos",
      shortLabel: "Docs",
      group: "closure",
      completion: "informational",
    },
  ];
}
