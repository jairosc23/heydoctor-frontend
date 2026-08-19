import test from "node:test";
import assert from "node:assert/strict";
import {
  DISCLOSURE_PREVIEW_SECTION_COUNT,
  ENCOUNTER_HOT_PATH_LANDMARK_IDS,
  ENCOUNTER_HOT_PATH_PERSIST_SURFACES,
  ENCOUNTER_HOT_PATH_SECTION_NUMBERS,
  ENCOUNTER_OPEN_DISCLOSURE_FETCH_BASELINE,
  disclosurePreviewFetchesOnEncounterOpen,
  encounterOpenFetchBudgetImprovedVersusBaseline,
  isEncounterHotPathId,
  isEncounterHotPathSectionNumber,
  shouldMountDisclosurePreviews,
} from "../app/panel/consultas/[id]/_components/encounter-hot-path";
import {
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
  buildClinicalNavigationIntelligence,
  shouldExpandDisclosureForSectionId,
} from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import type { ClinicalEncounterChartProps } from "../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart";
import { EMPTY_PHYSICAL_EXAM } from "./physical-exam-framework";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const memory: PatientClinicalMemory = {
  patientId: "patient-1",
  activeConditions: [],
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

test("E4-1 hot path is primary care path plus offer HAB and firma, not CIP", () => {
  assert.deepEqual([...ENCOUNTER_HOT_PATH_SECTION_NUMBERS], [
    1, 3, 4, 9, 10, 11, 12, 13, 20, 22,
  ]);
  assert.deepEqual([...ENCOUNTER_HOT_PATH_LANDMARK_IDS], [
    ENCOUNTER_OFFER_ID,
    ENCOUNTER_HAB_ID,
    "encounter-cic",
  ]);
  assert.deepEqual([...ENCOUNTER_HOT_PATH_PERSIST_SURFACES], [
    "prescription",
    "lab_order",
    "referral",
    "sign",
  ]);
  assert.equal(isEncounterHotPathSectionNumber(1), true);
  assert.equal(isEncounterHotPathSectionNumber(20), true);
  assert.equal(isEncounterHotPathSectionNumber(22), true);
  assert.equal(isEncounterHotPathSectionNumber(21), false);
  assert.equal(isEncounterHotPathSectionNumber(23), false);
  assert.equal(isEncounterHotPathSectionNumber(44), false);
  assert.equal(isEncounterHotPathId("encounter-section-13"), true);
  assert.equal(isEncounterHotPathId("encounter-offer"), true);
  assert.equal(isEncounterHotPathId("encounter-hab"), true);
  assert.equal(isEncounterHotPathId("encounter-cic"), true);
  assert.equal(isEncounterHotPathId("encounter-section-21"), false);
  assert.equal(isEncounterHotPathId("encounter-section-44"), false);
  assert.equal(ENCOUNTER_OPEN_DISCLOSURE_FETCH_BASELINE, 23);
  assert.equal(DISCLOSURE_PREVIEW_SECTION_COUNT, 23);
});

test("E4-2 collapsed encounter open does not start disclosure GET previews", () => {
  assert.equal(shouldMountDisclosurePreviews(false), false);
  assert.equal(disclosurePreviewFetchesOnEncounterOpen(false), 0);
  assert.equal(shouldMountDisclosurePreviews(true), true);
  assert.equal(disclosurePreviewFetchesOnEncounterOpen(true), 23);
  assert.equal(
    encounterOpenFetchBudgetImprovedVersusBaseline(false),
    true,
  );
});

test("E4-3 deep links still expand disclosure and signatureReady is unchanged", () => {
  const sections = buildClinicalNavigationIntelligence(chartFixture()).sections;
  assert.equal(
    shouldExpandDisclosureForSectionId(sections, "encounter-section-21"),
    true,
  );
  assert.equal(
    shouldExpandDisclosureForSectionId(sections, "encounter-section-44"),
    true,
  );
  assert.equal(
    shouldMountDisclosurePreviews(
      shouldExpandDisclosureForSectionId(sections, "encounter-section-21"),
    ),
    true,
  );
  assert.equal(
    shouldExpandDisclosureForSectionId(sections, "encounter-section-20"),
    false,
  );
  const ready = buildClinicalNavigationIntelligence(
    chartFixture({
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
  assert.equal(ready.progress.signatureReady, true);
  assert.equal(
    ready.sections.find((section) => section.sectionNumber === 21)?.id,
    "encounter-section-21",
  );
  assert.equal(
    ready.sections.find((section) => section.sectionNumber === 44)?.id,
    "encounter-section-44",
  );
});
