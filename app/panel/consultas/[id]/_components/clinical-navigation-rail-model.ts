import { hasClinicalVitalSignsData } from "@/lib/clinical-vital-signs-context";
import { hasPhysicalExamData } from "@/lib/physical-exam-framework";
import type { PatientProfile } from "@/lib/services/patients";
import type { ClinicalEncounterChartProps } from "./chart/ClinicalEncounterChart";

export type ClinicalNavigationGroup = "context" | "documentation" | "closure";
/**
 * E2 care path. Primary is the minimum flow needed to complete a
 * Signature-ready clinical encounter. Any future surface is classified by:
 * "Is it indispensable to complete the clinical encounter?" If no → disclosure.
 */
export type ClinicalNavigationLane = "primary" | "disclosure";
export type ClinicalNavigationCompletion =
  | "empty"
  | "in_progress"
  | "completed"
  | "warning"
  | "blocked";
export type ClinicalNavigationRisk = "critical" | "warning" | "info";

/**
 * Rail sections indispensable to complete/sign the encounter
 * (context → SOAP → closure). Rx/lab/referral live in HAB-gated panels, not here.
 */
export const PRIMARY_ENCOUNTER_SECTION_NUMBERS = [
  1, 3, 4, 9, 10, 11, 12, 13, 20, 22,
] as const;

const PRIMARY_ENCOUNTER_SECTION_NUMBER_SET = new Set<number>(
  PRIMARY_ENCOUNTER_SECTION_NUMBERS,
);

/**
 * E2 rule: every disclosure surface stays reachable in at most one click.
 * Chrome (E2-2) must not delete sections, break deep links, or add navigation.
 */
export const DISCLOSURE_MAX_CLICKS = 1 as const;

export function classifyEncounterSectionLane(
  sectionNumber: number,
): ClinicalNavigationLane {
  return PRIMARY_ENCOUNTER_SECTION_NUMBER_SET.has(sectionNumber)
    ? "primary"
    : "disclosure";
}

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
  lane: ClinicalNavigationLane;
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
  const canSign = Boolean(chart.closure?.canSign);
  const signatureReady = signedOrLocked || canSign;
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
  if (!signedOrLocked && !canSign) {
    validationIssues.push(
      issue(
        "missing_signature_prerequisites",
        "encounter-section-20",
        "Firma no habilitada para el estado actual",
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

  const sectionDrafts: Array<Omit<ClinicalNavigationSection, "lane">> = [
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
        ? "Antecedentes del paciente disponibles"
        : profileLoading
          ? "Cargando antecedentes"
          : "Sin antecedentes del paciente registrados",
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
      id: "encounter-section-21",
      sectionNumber: 21,
      label: "Clinical Documents",
      shortLabel: "CDE",
      group: "documentation",
      completion: "completed",
      helperText: "Preview y PDF del Clinical Documents Engine",
    },
    {
      id: "encounter-section-23",
      sectionNumber: 23,
      label: "Clinical Orders",
      shortLabel: "Órdenes",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Orders Engine",
    },
    {
      id: "encounter-section-24",
      sectionNumber: 24,
      label: "Clinical Decisions",
      shortLabel: "CDS",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Decision Support Engine",
    },
    {
      id: "encounter-section-25",
      sectionNumber: 25,
      label: "Clinical Authority",
      shortLabel: "Autoridad",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Authority Spine",
    },
    {
      id: "encounter-section-26",
      sectionNumber: 26,
      label: "Clinical Artifacts",
      shortLabel: "Artefactos",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Artifact Registry",
    },
    {
      id: "encounter-section-27",
      sectionNumber: 27,
      label: "Longitudinal Clinical Record",
      shortLabel: "Longitudinal",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Longitudinal Clinical Record",
    },
    {
      id: "encounter-section-28",
      sectionNumber: 28,
      label: "Clinical Rules Evaluator",
      shortLabel: "Reglas",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Rules Evaluator",
    },
    {
      id: "encounter-section-29",
      sectionNumber: 29,
      label: "Clinical Understanding",
      shortLabel: "Comprensión",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Understanding",
    },
    {
      id: "encounter-section-30",
      sectionNumber: 30,
      label: "Clinical Reasoning",
      shortLabel: "Razonamiento",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Reasoning",
    },
    {
      id: "encounter-section-31",
      sectionNumber: 31,
      label: "Clinical Recommendation",
      shortLabel: "Recomendación",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Recommendation",
    },
    {
      id: "encounter-section-32",
      sectionNumber: 32,
      label: "Clinical Outcomes",
      shortLabel: "Resultados",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Outcomes",
    },
    {
      id: "encounter-section-33",
      sectionNumber: 33,
      label: "Clinical Governance",
      shortLabel: "Gobernanza",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Governance",
    },
    {
      id: "encounter-section-34",
      sectionNumber: 34,
      label: "Human Decision",
      shortLabel: "Decisión",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Human Decision",
    },
    {
      id: "encounter-section-35",
      sectionNumber: 35,
      label: "Clinical Execution",
      shortLabel: "Ejecución",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Execution",
    },
    {
      id: "encounter-section-36",
      sectionNumber: 36,
      label: "Clinical Learning",
      shortLabel: "Aprendizaje",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Learning",
    },
    {
      id: "encounter-section-37",
      sectionNumber: 37,
      label: "Clinical Reentry",
      shortLabel: "Reingreso",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Reentry",
    },
    {
      id: "encounter-section-38",
      sectionNumber: 38,
      label: "Clinical Knowledge",
      shortLabel: "Conocimiento",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Knowledge",
    },
    {
      id: "encounter-section-39",
      sectionNumber: 39,
      label: "Clinical Evidence",
      shortLabel: "Evidencia",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Evidence",
    },
    {
      id: "encounter-section-40",
      sectionNumber: 40,
      label: "Clinical Scientific Governance",
      shortLabel: "Gob. científica",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Scientific Governance",
    },
    {
      id: "encounter-section-41",
      sectionNumber: 41,
      label: "Clinical Knowledge Federation",
      shortLabel: "Federación",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Knowledge Federation",
    },
    {
      id: "encounter-section-42",
      sectionNumber: 42,
      label: "Clinical Knowledge Jurisdiction",
      shortLabel: "Jurisdicción",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Knowledge Jurisdiction",
    },
    {
      id: "encounter-section-43",
      sectionNumber: 43,
      label: "Clinical Knowledge Engine",
      shortLabel: "Motor",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Knowledge Engine",
    },
    {
      id: "encounter-section-44",
      sectionNumber: 44,
      label: "Clinical Knowledge Grounding",
      shortLabel: "Atribución",
      group: "documentation",
      completion: "completed",
      helperText: "Preview HTTP del Clinical Knowledge Grounding",
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
          : "Firma no habilitada para el estado actual",
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

  const sections: ClinicalNavigationSection[] = sectionDrafts.map((section) => ({
    ...section,
    lane: classifyEncounterSectionLane(section.sectionNumber),
  }));

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

export function primaryEncounterSections(
  sections: ClinicalNavigationSection[],
): ClinicalNavigationSection[] {
  return sections.filter((section) => section.lane === "primary");
}

export function disclosureEncounterSections(
  sections: ClinicalNavigationSection[],
): ClinicalNavigationSection[] {
  return sections.filter((section) => section.lane === "disclosure");
}

export const DISCLOSURE_RAIL_LABEL = "Previews clínicas";

export type ClinicalNavigationRailEntry =
  | { type: "section"; section: ClinicalNavigationSection }
  | { type: "disclosure-toggle"; count: number }
  | {
      type: "care-path-landmark";
      id: string;
      step: "offer" | "authorization" | "copilot";
      label: string;
      shortLabel: string;
    };

export type ClinicalCarePathStep =
  | "context"
  | "soap"
  | "offer"
  | "authorization"
  | "closure";

export const ENCOUNTER_OFFER_ID = "encounter-offer";
export const ENCOUNTER_HAB_ID = "encounter-hab";
export const ENCOUNTER_CIC_ID = "encounter-cic";

export const SIGNATURE_READY_CARE_PATH: ClinicalCarePathStep[] = [
  "context",
  "soap",
  "offer",
  "authorization",
  "closure",
];

export const CARE_PATH_STEP_LABELS: Record<ClinicalCarePathStep, string> = {
  context: "Contexto",
  soap: "SOAP",
  offer: "Oferta clínica",
  authorization: "Autorización humana",
  closure: "Firma / Documentos",
};

const SOAP_SECTION_NUMBERS = new Set([3, 9, 10, 11, 12, 13]);

export function carePathStepForSectionNumber(
  sectionNumber: number,
): ClinicalCarePathStep | null {
  if (sectionNumber === 1 || sectionNumber === 4) return "context";
  if (SOAP_SECTION_NUMBERS.has(sectionNumber)) return "soap";
  if (sectionNumber === 20 || sectionNumber === 22) return "closure";
  return null;
}

export function isEncounterOfferLandmark(sectionId: string | null | undefined): boolean {
  return sectionId === ENCOUNTER_OFFER_ID || sectionId === ENCOUNTER_HAB_ID;
}

export function isEncounterCarePathLandmark(sectionId: string | null | undefined): boolean {
  return (
    isEncounterOfferLandmark(sectionId) || sectionId === ENCOUNTER_CIC_ID
  );
}

export type SignatureReadyRailGroup = {
  key: string;
  label: string;
  entries: ClinicalNavigationRailEntry[];
};

export function buildSignatureReadyRailGroups(
  sections: ClinicalNavigationSection[],
  disclosureExpanded: boolean,
): SignatureReadyRailGroup[] {
  const byStep: Record<"context" | "soap" | "closure", ClinicalNavigationSection[]> = {
    context: [],
    soap: [],
    closure: [],
  };
  for (const section of sections) {
    if (section.lane === "disclosure") continue;
    const step = carePathStepForSectionNumber(section.sectionNumber);
    if (step === "context" || step === "soap" || step === "closure") {
      byStep[step].push(section);
    }
  }

  const groups: SignatureReadyRailGroup[] = [];
  for (const step of SIGNATURE_READY_CARE_PATH) {
    if (step === "soap") {
      const stepSections = byStep.soap;
      if (stepSections.length > 0) {
        groups.push({
          key: "soap",
          label: CARE_PATH_STEP_LABELS.soap,
          entries: [
            ...stepSections.map((section) => ({
              type: "section" as const,
              section,
            })),
            {
              type: "care-path-landmark",
              id: ENCOUNTER_CIC_ID,
              step: "copilot",
              label: "HeyDoctor Copilot",
              shortLabel: "Copilot",
            },
          ],
        });
      }
      continue;
    }
    if (step === "offer") {
      groups.push({
        key: "offer",
        label: CARE_PATH_STEP_LABELS.offer,
        entries: [
          {
            type: "care-path-landmark",
            id: ENCOUNTER_OFFER_ID,
            step: "offer",
            label: "Prescription / Lab / Referral",
            shortLabel: "Oferta",
          },
        ],
      });
      continue;
    }
    if (step === "authorization") {
      groups.push({
        key: "authorization",
        label: CARE_PATH_STEP_LABELS.authorization,
        entries: [
          {
            type: "care-path-landmark",
            id: ENCOUNTER_HAB_ID,
            step: "authorization",
            label: "HAB",
            shortLabel: "HAB",
          },
        ],
      });
      continue;
    }
    const stepSections = byStep[step];
    if (stepSections.length === 0) continue;
    groups.push({
      key: step,
      label: CARE_PATH_STEP_LABELS[step],
      entries: stepSections.map((section) => ({ type: "section" as const, section })),
    });
  }

  const disclosure = disclosureEncounterSections(sections);
  if (disclosure.length > 0) {
    const entries: ClinicalNavigationRailEntry[] = [
      { type: "disclosure-toggle", count: disclosure.length },
    ];
    if (disclosureExpanded) {
      for (const section of disclosure) {
        entries.push({ type: "section", section });
      }
    }
    groups.push({
      key: "disclosure",
      label: DISCLOSURE_RAIL_LABEL,
      entries,
    });
  }
  return groups;
}

export function flattenSignatureReadyRailEntries(
  groups: SignatureReadyRailGroup[],
): ClinicalNavigationRailEntry[] {
  return groups.flatMap((group) => group.entries);
}

/**
 * Keep Firma / Documentos pinned outside the rail overflow so the
 * Signature-ready close path stays reachable while SOAP or disclosure scroll.
 */
export function partitionSignatureReadyRailGroups(
  groups: SignatureReadyRailGroup[],
): {
  scrollable: SignatureReadyRailGroup[];
  pinnedClosure: SignatureReadyRailGroup | null;
} {
  let pinnedClosure: SignatureReadyRailGroup | null = null;
  const scrollable: SignatureReadyRailGroup[] = [];
  for (const group of groups) {
    if (group.key === "closure") {
      pinnedClosure = group;
      continue;
    }
    scrollable.push(group);
  }
  return { scrollable, pinnedClosure };
}

export function shouldExpandDisclosureForSectionId(
  sections: Array<Pick<ClinicalNavigationSection, "id" | "lane">>,
  sectionId: string | null | undefined,
): boolean {
  if (!sectionId) return false;
  return sections.some(
    (section) => section.id === sectionId && section.lane === "disclosure",
  );
}

export function encounterHashSectionId(hash: string | null | undefined): string | null {
  if (!hash) return null;
  const sectionId = hash.startsWith("#") ? hash.slice(1) : hash;
  return sectionId.startsWith("encounter-section-") ? sectionId : null;
}

/**
 * Preserve model order. Insert a single disclosure toggle before each
 * contiguous disclosure run. Collapsed chrome omits those sections.
 */
export function buildClinicalNavigationRailEntries(
  sections: ClinicalNavigationSection[],
  disclosureExpanded: boolean,
): ClinicalNavigationRailEntry[] {
  const entries: ClinicalNavigationRailEntry[] = [];
  let index = 0;
  while (index < sections.length) {
    const current = sections[index];
    if (!current) break;
    if (current.lane === "disclosure") {
      const start = index;
      while (index < sections.length && sections[index]?.lane === "disclosure") {
        index += 1;
      }
      const disclosure = sections.slice(start, index);
      entries.push({ type: "disclosure-toggle", count: disclosure.length });
      if (disclosureExpanded) {
        for (const section of disclosure) {
          entries.push({ type: "section", section });
        }
      }
      continue;
    }
    entries.push({ type: "section", section: current });
    index += 1;
  }
  return entries;
}
