import test from "node:test";
import assert from "node:assert/strict";
import {
  PRIMARY_ENCOUNTER_SECTION_NUMBERS,
  DISCLOSURE_MAX_CLICKS,
  buildClinicalNavigationIntelligence,
  ENCOUNTER_CIC_ID,
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
  SIGNATURE_READY_CARE_PATH,
  buildClinicalNavigationRailEntries,
  buildClinicalNavigationSections,
  buildSignatureReadyRailGroups,
  classifyEncounterSectionLane,
  disclosureEncounterSections,
  encounterHashSectionId,
  flattenSignatureReadyRailEntries,
  isEncounterCarePathLandmark,
  partitionSignatureReadyRailGroups,
  primaryEncounterSections,
  shouldExpandDisclosureForSectionId,
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
    onDiagnosisChange: () => undefined,
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

  assert.equal(sections.length, 33);
  assert.equal(sections[0]?.completion, "completed");
  assert.equal(sections.at(-1)?.sectionNumber, 22);
  assert.equal(
    sections.find((section) => section.sectionNumber === 21)?.id,
    "encounter-section-21",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 23)?.id,
    "encounter-section-23",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 24)?.id,
    "encounter-section-24",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 25)?.id,
    "encounter-section-25",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 26)?.id,
    "encounter-section-26",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 27)?.id,
    "encounter-section-27",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 28)?.id,
    "encounter-section-28",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 29)?.id,
    "encounter-section-29",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 30)?.id,
    "encounter-section-30",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 31)?.id,
    "encounter-section-31",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 32)?.id,
    "encounter-section-32",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 33)?.id,
    "encounter-section-33",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 34)?.id,
    "encounter-section-34",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 35)?.id,
    "encounter-section-35",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 36)?.id,
    "encounter-section-36",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 37)?.id,
    "encounter-section-37",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 38)?.id,
    "encounter-section-38",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 39)?.id,
    "encounter-section-39",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 40)?.id,
    "encounter-section-40",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 41)?.id,
    "encounter-section-41",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 42)?.id,
    "encounter-section-42",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 43)?.id,
    "encounter-section-43",
  );
  assert.equal(
    sections.find((section) => section.sectionNumber === 44)?.id,
    "encounter-section-44",
  );
});

test("E2-1 classifies every rail section as primary or disclosure", () => {
  const sections = buildClinicalNavigationSections(chartFixture());
  const primaryNumbers = sections
    .filter((section) => section.lane === "primary")
    .map((section) => section.sectionNumber)
    .sort((a, b) => a - b);
  const disclosureNumbers = sections
    .filter((section) => section.lane === "disclosure")
    .map((section) => section.sectionNumber)
    .sort((a, b) => a - b);

  assert.equal(sections.length, 33);
  assert.equal(
    sections.every((section) => section.lane === "primary" || section.lane === "disclosure"),
    true,
  );
  assert.deepEqual(primaryNumbers, [...PRIMARY_ENCOUNTER_SECTION_NUMBERS]);
  assert.deepEqual(
    disclosureNumbers,
    [21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
  );
  assert.equal(primaryEncounterSections(sections).length, 10);
  assert.equal(disclosureEncounterSections(sections).length, 23);
  assert.equal(
    sections.every((section) => section.id === `encounter-section-${section.sectionNumber}`),
    true,
  );
});

test("E2-1 keeps constitutional previews in disclosure and defaults unknown sections there", () => {
  assert.equal(classifyEncounterSectionLane(1), "primary");
  assert.equal(classifyEncounterSectionLane(20), "primary");
  assert.equal(classifyEncounterSectionLane(22), "primary");
  assert.equal(classifyEncounterSectionLane(21), "disclosure");
  assert.equal(classifyEncounterSectionLane(38), "disclosure");
  assert.equal(classifyEncounterSectionLane(44), "disclosure");
  assert.equal(classifyEncounterSectionLane(45), "disclosure");
  assert.equal(DISCLOSURE_MAX_CLICKS, 1);
});

test("E2-1 does not relax signatureReady or remove rail sections", () => {
  const empty = buildClinicalNavigationIntelligence(chartFixture());
  const ready = buildClinicalNavigationIntelligence(
    chartFixture({
      presentIllnessHistory: "Cefalea de dos días de evolución.",
      diagnosis: "Cefalea",
      diagnosisCode: "R51",
      treatment: "Ibuprofeno y control según evolución.",
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

  assert.equal(empty.progress.signatureReady, false);
  assert.equal(ready.progress.signatureReady, true);
  assert.equal(empty.sections.length, 33);
  assert.equal(ready.sections.length, 33);
  assert.equal(
    empty.sections.find((section) => section.sectionNumber === 21)?.id,
    "encounter-section-21",
  );
  assert.equal(
    empty.sections.find((section) => section.sectionNumber === 44)?.id,
    "encounter-section-44",
  );
});

test("E2-2 collapses disclosure by default and preserves section order", () => {
  const sections = buildClinicalNavigationSections(chartFixture());
  const collapsed = buildClinicalNavigationRailEntries(sections, false);
  const expanded = buildClinicalNavigationRailEntries(sections, true);
  const collapsedSectionNumbers = collapsed
    .filter((entry) => entry.type === "section")
    .map((entry) => entry.section.sectionNumber);
  const expandedSectionNumbers = expanded
    .filter((entry) => entry.type === "section")
    .map((entry) => entry.section.sectionNumber);
  const toggle = collapsed.find((entry) => entry.type === "disclosure-toggle");

  assert.deepEqual(collapsedSectionNumbers, [1, 4, 3, 9, 10, 11, 12, 13, 20, 22]);
  assert.equal(toggle?.type === "disclosure-toggle" ? toggle.count : 0, 23);
  assert.equal(
    collapsed.filter((entry) => entry.type === "disclosure-toggle").length,
    1,
  );
  assert.deepEqual(
    expandedSectionNumbers,
    sections.map((section) => section.sectionNumber),
  );
  assert.equal(DISCLOSURE_MAX_CLICKS, 1);
});

test("E2-2 expands disclosure only for existing deep links 21 and 23-44", () => {
  const sections = buildClinicalNavigationSections(chartFixture());

  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-1"), false);
  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-20"), false);
  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-22"), false);
  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-21"), true);
  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-23"), true);
  assert.equal(shouldExpandDisclosureForSectionId(sections, "encounter-section-44"), true);
  assert.equal(encounterHashSectionId("#encounter-section-44"), "encounter-section-44");
  assert.equal(encounterHashSectionId("encounter-section-21"), "encounter-section-21");
  assert.equal(encounterHashSectionId("#orders"), null);
  assert.equal(
    buildClinicalNavigationIntelligence(chartFixture({
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
    })).progress.signatureReady,
    true,
  );
});

test("E2-3 renders Signature-ready care path before disclosure", () => {
  const sections = buildClinicalNavigationSections(chartFixture());
  const groups = buildSignatureReadyRailGroups(sections, false);
  const keys = groups.map((group) => group.key);
  const flattened = flattenSignatureReadyRailEntries(groups);
  const sectionNumbers = flattened
    .filter((entry) => entry.type === "section")
    .map((entry) => entry.section.sectionNumber);
  const landmarks = flattened.filter((entry) => entry.type === "care-path-landmark");
  const offerIndex = flattened.findIndex(
    (entry) => entry.type === "care-path-landmark" && entry.step === "offer",
  );
  const habIndex = flattened.findIndex(
    (entry) =>
      entry.type === "care-path-landmark" && entry.step === "authorization",
  );
  const firmaIndex = flattened.findIndex(
    (entry) => entry.type === "section" && entry.section.sectionNumber === 20,
  );
  const soapIndex = flattened.findIndex(
    (entry) => entry.type === "section" && entry.section.sectionNumber === 13,
  );
  const toggleIndex = flattened.findIndex(
    (entry) => entry.type === "disclosure-toggle",
  );

  assert.deepEqual(keys, [
    "context",
    "soap",
    "offer",
    "authorization",
    "closure",
    "disclosure",
  ]);
  assert.deepEqual(SIGNATURE_READY_CARE_PATH, [
    "context",
    "soap",
    "offer",
    "authorization",
    "closure",
  ]);
  assert.deepEqual(sectionNumbers, [1, 4, 3, 9, 10, 11, 12, 13, 20, 22]);
  assert.equal(landmarks[0]?.id, ENCOUNTER_CIC_ID);
  assert.equal(landmarks[1]?.id, ENCOUNTER_OFFER_ID);
  assert.equal(landmarks[2]?.id, ENCOUNTER_HAB_ID);
  assert.equal(isEncounterCarePathLandmark(ENCOUNTER_OFFER_ID), true);
  assert.equal(isEncounterCarePathLandmark(ENCOUNTER_CIC_ID), true);
  assert.equal(isEncounterCarePathLandmark("encounter-section-21"), false);
  const cicIndex = flattened.findIndex(
    (entry) => entry.type === "care-path-landmark" && entry.id === ENCOUNTER_CIC_ID,
  );
  assert.ok(soapIndex < cicIndex);
  assert.ok(cicIndex < offerIndex);
  assert.ok(offerIndex < habIndex);
  assert.ok(habIndex < firmaIndex);
  assert.ok(firmaIndex < toggleIndex);
  assert.equal(
    flattened.some(
      (entry) =>
        entry.type === "section" && entry.section.sectionNumber === 21,
    ),
    false,
  );
  assert.equal(
    buildClinicalNavigationIntelligence(
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
    ).progress.signatureReady,
    true,
  );
});

test("pins Firma/Documentos outside the scrollable rail groups", () => {
  const sections = buildClinicalNavigationSections(chartFixture());
  const groups = buildSignatureReadyRailGroups(sections, true);
  const { scrollable, pinnedClosure } = partitionSignatureReadyRailGroups(groups);

  assert.equal(pinnedClosure?.key, "closure");
  assert.deepEqual(
    pinnedClosure?.entries
      .filter((entry) => entry.type === "section")
      .map((entry) => entry.section.sectionNumber),
    [20, 22],
  );
  assert.equal(
    scrollable.some((group) => group.key === "closure"),
    false,
  );
  assert.deepEqual(
    scrollable.map((group) => group.key),
    ["context", "soap", "offer", "authorization", "disclosure"],
  );
  assert.equal(
    flattenSignatureReadyRailEntries(scrollable).some(
      (entry) =>
        entry.type === "section" &&
        (entry.section.sectionNumber === 20 ||
          entry.section.sectionNumber === 22),
    ),
    false,
  );
});


