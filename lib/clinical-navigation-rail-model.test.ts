import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClinicalNavigationIntelligence,
  buildClinicalNavigationSections,
} from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import type { ClinicalEncounterChartProps } from "../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart";
import { EMPTY_PHYSICAL_EXAM } from "./physical-exam-framework";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const memory: PatientClinicalMemory = {
  patientId: "patient-1",
  activeConditions: [
    { code: "I10", label: "Hipertensión arterial", source: "cie10" },
  ],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

const documentHandlers = {} as NonNullable<
  ClinicalEncounterChartProps["closure"]
>["documentHandlers"];

function chartFixture(
  overrides: Partial<ClinicalEncounterChartProps> = {},
): ClinicalEncounterChartProps {
  return {
    vitals: {},
    onVitalsChange: () => undefined,
    physicalExam: { ...EMPTY_PHYSICAL_EXAM },
    onPhysicalExamChange: () => undefined,
    presentIllnessHistory: "",
    onPresentIllnessHistoryChange: () => undefined,
    treatment: "",
    onTreatmentChange: () => undefined,
    clinicId: "clinic-1",
    diagnosis: "",
    diagnosisError: null,
    onDiagnosisConfirm: () => undefined,
    patientId: "patient-1",
    clinicalMemory: memory,
    editable: true,
    closure: {
      status: "draft",
      isSigned: false,
      isLocked: false,
      canSign: false,
      signing: false,
      onSign: () => undefined,
      documentHandlers,
      documentLoading: {},
      documentDisabled: {},
    },
    ...overrides,
  };
}

test("buildClinicalNavigationIntelligence flags missing documentation blockers", () => {
  const model = buildClinicalNavigationIntelligence(chartFixture());
  const signature = model.sections.find((section) => section.sectionNumber === 20);
  const diagnosis = model.sections.find((section) => section.sectionNumber === 11);
  const treatment = model.sections.find((section) => section.sectionNumber === 13);

  assert.equal(diagnosis?.completion, "warning");
  assert.equal(treatment?.completion, "warning");
  assert.equal(signature?.completion, "blocked");
  assert.equal(signature?.risk, "critical");
  assert.equal(model.progress.signatureReady, false);
  assert.equal(
    model.validationIssues.some((issue) => issue.code === "missing_diagnosis"),
    true,
  );
  assert.equal(
    model.validationIssues.some((issue) => issue.code === "missing_treatment"),
    true,
  );
  assert.equal(
    model.validationIssues.some(
      (issue) => issue.code === "missing_signature_prerequisites",
    ),
    true,
  );
});

test("buildClinicalNavigationIntelligence marks signature ready before signing", () => {
  const model = buildClinicalNavigationIntelligence(
    chartFixture({
      presentIllnessHistory: "Cefalea de dos días de evolución.",
      diagnosis: "Cefalea",
      diagnosisCode: "R51",
      treatment: "Ibuprofeno y control según evolución.",
      vitals: { systolic: 120, diastolic: 80 },
      physicalExam: { ...EMPTY_PHYSICAL_EXAM, general: "Buen estado general" },
      closure: {
        status: "draft",
        isSigned: false,
        isLocked: false,
        canSign: true,
        signing: false,
        onSign: () => undefined,
        documentHandlers,
        documentLoading: {},
        documentDisabled: {},
      },
    }),
  );
  const signature = model.sections.find((section) => section.sectionNumber === 20);
  const documents = model.sections.find((section) => section.sectionNumber === 22);

  assert.equal(model.progress.signatureReady, true);
  assert.equal(signature?.completion, "in_progress");
  assert.equal(documents?.completion, "blocked");
  assert.equal(documents?.risk, "info");
  assert.ok(model.progress.completionPercentage > 50);
});

test("buildClinicalNavigationIntelligence follows closure canSign for signature readiness", () => {
  const model = buildClinicalNavigationIntelligence(
    chartFixture({
      presentIllnessHistory: "",
      diagnosis: "",
      treatment: "",
      closure: {
        status: "in_progress",
        isSigned: false,
        isLocked: false,
        canSign: true,
        signing: false,
        onSign: () => undefined,
        documentHandlers,
        documentLoading: {},
        documentDisabled: {},
      },
    }),
  );
  const signature = model.sections.find((section) => section.sectionNumber === 20);
  const documents = model.sections.find((section) => section.sectionNumber === 22);

  assert.equal(model.progress.signatureReady, true);
  assert.equal(signature?.completion, "in_progress");
  assert.equal(signature?.risk, undefined);
  assert.equal(
    model.validationIssues.some(
      (issue) => issue.code === "missing_signature_prerequisites",
    ),
    false,
  );
  assert.equal(documents?.completion, "blocked");
  assert.equal(documents?.risk, "info");
});

test("buildClinicalNavigationIntelligence completes signed encounters", () => {
  const model = buildClinicalNavigationIntelligence(
    chartFixture({
      presentIllnessHistory: "Control por hipertensión arterial.",
      diagnosis: "Hipertensión arterial",
      diagnosisCode: "I10",
      treatment: "Continuar losartán y control con perfil renal.",
      vitals: { systolic: 128, diastolic: 78 },
      physicalExam: { ...EMPTY_PHYSICAL_EXAM, cardiovascular: "Ritmo regular" },
      longitudinal: {
        patient: null,
        profile: {
          chronicConditions: [{ label: "Hipertensión arterial" }],
          medications: [{ label: "Losartán" }],
        },
      },
      closure: {
        status: "signed",
        isSigned: true,
        isLocked: false,
        canSign: false,
        signing: false,
        onSign: () => undefined,
        documentHandlers,
        documentLoading: {},
        documentDisabled: {},
      },
    }),
  );

  assert.equal(model.validationIssues.length, 0);
  assert.equal(model.progress.signatureReady, true);
  assert.equal(model.progress.completedSections, model.progress.totalSections);
  assert.equal(model.progress.completionPercentage, 100);
});

test("buildClinicalNavigationSections keeps backwards-compatible section output", () => {
  const sections = buildClinicalNavigationSections(chartFixture());

  assert.equal(sections.length, 11);
  assert.equal(sections[0]?.completion, "completed");
  assert.equal(sections.at(-1)?.sectionNumber, 22);
  assert.equal(
    sections.find((section) => section.sectionNumber === 21)?.id,
    "encounter-section-21",
  );
});
