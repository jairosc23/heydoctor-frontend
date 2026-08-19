import test from "node:test";
import assert from "node:assert/strict";
import {
  DISCLOSURE_MAX_CLICKS,
  buildClinicalNavigationIntelligence,
  shouldExpandDisclosureForSectionId,
} from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import { shouldMountDisclosurePreviews } from "../app/panel/consultas/[id]/_components/encounter-hot-path";
import {
  CIP_DISCLOSURE_HOPS,
  ENCOUNTER_HOT_PATH_SLO_BUDGET_MS,
  ENCOUNTER_HOT_PATH_SLO_SELECTORS,
  HOT_PATH_SLO_PHASES,
  __resetEncounterHotPathSloForTests,
  classifyCipHopFromPath,
  createEncounterHotPathSloWatch,
  evaluateCipHop,
  evaluateEncounterHotPathSlo,
  ingestCipResourceEntries,
  recordCipHop,
  recordEncounterHotPathSample,
  recordEncounterWebVital,
  snapshotEncounterHotPathSlo,
} from "../app/panel/consultas/[id]/_components/encounter-hot-path-slo";
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

test("E5-1 hot path SLO alerts only on SOAP offer and sign carga", () => {
  __resetEncounterHotPathSloForTests();
  assert.deepEqual([...HOT_PATH_SLO_PHASES], ["open", "soap", "offer", "sign"]);
  assert.equal(
    ENCOUNTER_HOT_PATH_SLO_SELECTORS.open.includes("encounter-hot-path"),
    true,
  );
  assert.equal(
    ENCOUNTER_HOT_PATH_SLO_SELECTORS.soap.includes("encounter-hot-path"),
    true,
  );
  assert.equal(
    ENCOUNTER_HOT_PATH_SLO_SELECTORS.offer.includes("encounter-offer"),
    true,
  );
  assert.equal(
    ENCOUNTER_HOT_PATH_SLO_SELECTORS.sign.includes("encounter-section-20"),
    true,
  );

  const pass = recordEncounterHotPathSample("soap", 400);
  assert.equal(pass.ok, true);
  assert.equal(pass.onHotPath, true);
  assert.equal(pass.alertable, true);
  assert.equal(pass.durationMs <= ENCOUNTER_HOT_PATH_SLO_BUDGET_MS.soap, true);

  const fail = evaluateEncounterHotPathSlo({
    phase: "sign",
    durationMs: ENCOUNTER_HOT_PATH_SLO_BUDGET_MS.sign + 1,
    samples: [ENCOUNTER_HOT_PATH_SLO_BUDGET_MS.sign + 1],
  });
  assert.equal(fail.ok, false);
  assert.equal(fail.alertable, true);
  assert.equal(fail.onHotPath, true);

  const offerFail = evaluateEncounterHotPathSlo({
    phase: "offer",
    durationMs: ENCOUNTER_HOT_PATH_SLO_BUDGET_MS.offer + 50,
    samples: [100, 200, ENCOUNTER_HOT_PATH_SLO_BUDGET_MS.offer + 50],
  });
  assert.equal(offerFail.ok, false);
  assert.equal(offerFail.alertable, true);
});

test("E5-1 SLO watch records phases asynchronously and times out without blocking", () => {
  const watch = createEncounterHotPathSloWatch({
    startedAtMs: 0,
    timeoutMs: 1000,
  });
  const present: Partial<Record<string, boolean>> = { open: true, soap: true };
  const first = watch.observe(120, (phase) => Boolean(present[phase]));
  assert.deepEqual(
    first.samples.map((sample) => sample.phase),
    ["open", "soap"],
  );
  assert.equal(first.done, false);

  const laterPresent: Partial<Record<string, boolean>> = {
    ...present,
    offer: true,
    sign: true,
  };
  const later = watch.observe(200, (phase) => Boolean(laterPresent[phase]));
  assert.deepEqual(
    later.samples.map((sample) => sample.phase),
    ["offer", "sign"],
  );
  assert.equal(later.done, true);

  const timeoutWatch = createEncounterHotPathSloWatch({
    startedAtMs: 0,
    timeoutMs: 50,
  });
  const timed = timeoutWatch.observe(50, () => false);
  assert.equal(timed.done, true);
  assert.equal(
    timed.samples.every((sample) => sample.timedOut),
    true,
  );
});

test("E5-2 CIP hops are classified from GET preview URLs and never alertable", () => {
  __resetEncounterHotPathSloForTests();
  assert.equal(CIP_DISCLOSURE_HOPS.length, 23);

  assert.equal(
    classifyCipHopFromPath(
      "/clinical-authority/prescription/preview?consultationId=c1",
    ),
    "clinical-authority",
  );
  assert.equal(
    classifyCipHopFromPath(
      "https://api.example/clinical-knowledge-grounding/attribution/preview",
    ),
    "clinical-knowledge-grounding",
  );
  assert.equal(
    classifyCipHopFromPath("/clinical-knowledge/pack/preview"),
    "clinical-knowledge",
  );
  assert.equal(
    classifyCipHopFromPath("/clinical-documents/rx/preview"),
    "clinical-documents",
  );
  assert.equal(
    classifyCipHopFromPath("/clinical-authority/prescription/confirm"),
    null,
  );
  assert.equal(classifyCipHopFromPath("/clinical-documents/rx/pdf"), null);
  assert.equal(classifyCipHopFromPath("/consultations/c1"), null);

  const slow = recordCipHop({
    hop: "clinical-authority",
    durationMs: 30_000,
  });
  assert.equal(slow.alertable, false);
  assert.equal(slow.onHotPath, false);

  const ingested = ingestCipResourceEntries([
    {
      name: "/human-decision/accept/preview?consultationId=c1",
      duration: 12,
    },
    { name: "/auth/me", duration: 9 },
    { name: "/clinical-orders/lab/write", duration: 40 },
  ]);
  assert.equal(ingested.length, 1);
  assert.equal(ingested[0]?.hop, "human-decision");
  assert.equal(ingested[0]?.alertable, false);
  assert.equal(ingested[0]?.onHotPath, false);
  assert.equal(
    evaluateCipHop({ hop: "clinical-evidence", durationMs: 1 }).alertable,
    false,
  );

  const snapshot = snapshotEncounterHotPathSlo();
  assert.equal(snapshot.disclosurePreviewSectionCount, 23);
  assert.equal(snapshot.cipHops.count >= 1, true);
});

test("E5-3 disclosure stays one click GET-only and signatureReady is unchanged", () => {
  assert.equal(DISCLOSURE_MAX_CLICKS, 1);
  assert.equal(shouldMountDisclosurePreviews(false), false);
  assert.equal(shouldMountDisclosurePreviews(true), true);

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
    ready.sections.find((section) => section.sectionNumber === 21)?.lane,
    "disclosure",
  );
  assert.equal(CIP_DISCLOSURE_HOPS.includes("clinical-authority"), true);
});

test("production hardening: encounter web vitals are traced and never alertable", () => {
  __resetEncounterHotPathSloForTests();
  const sample = recordEncounterWebVital({ name: "CLS", value: 0.12 });
  assert.equal(sample.alertable, false);
  assert.equal(sample.onHotPath, true);
  const snapshot = snapshotEncounterHotPathSlo();
  assert.equal(snapshot.webVitals.alertable, false);
  assert.equal(snapshot.webVitals.count >= 1, true);
});
