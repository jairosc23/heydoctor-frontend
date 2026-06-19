import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClinicalEncounterIntelligence,
  type ClinicalEncounterIntelligenceInput,
} from "../app/panel/consultas/[id]/_components/clinical-encounter-intelligence-model";
import type { ClinicalNavigationIntelligence } from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import type { NestConsultation } from "./services/consultations";
import type { PatientProfile } from "./services/patients";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const consultation = {
  id: "consultation-1",
  patientId: "patient-1",
  status: "in_progress",
} as NestConsultation;

const emptyMemory: PatientClinicalMemory = {
  patientId: "patient-1",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

function navigationFixture(
  overrides: Partial<ClinicalNavigationIntelligence> = {},
): ClinicalNavigationIntelligence {
  return {
    sections: [
      {
        id: "encounter-section-20",
        sectionNumber: 20,
        label: "Firma",
        shortLabel: "Firma",
        group: "closure",
        completion: "in_progress",
      },
    ],
    progress: {
      totalSections: 10,
      completedSections: 4,
      pendingSections: 6,
      completionPercentage: 42,
      signatureReady: true,
      criticalPendingSections: 0,
    },
    validationIssues: [],
    ...overrides,
  };
}

function inputFixture(
  overrides: Partial<ClinicalEncounterIntelligenceInput> = {},
): ClinicalEncounterIntelligenceInput {
  return {
    consultation,
    patientProfile: null,
    clinicalMemory: emptyMemory,
    timeline: [],
    navigationIntelligence: navigationFixture(),
    ...overrides,
  };
}

test("buildClinicalEncounterIntelligence reuses navigation source of truth", () => {
  const model = buildClinicalEncounterIntelligence(
    inputFixture({
      navigationIntelligence: navigationFixture({
        progress: {
          totalSections: 10,
          completedSections: 7,
          pendingSections: 3,
          completionPercentage: 73,
          signatureReady: false,
          criticalPendingSections: 1,
        },
      }),
    }),
  );

  assert.equal(model.sourceOfTruth.completionPercentage, 73);
  assert.equal(model.sourceOfTruth.completedSections, 7);
  assert.equal(model.sourceOfTruth.pendingSections, 3);
  assert.equal(model.sourceOfTruth.signatureReady, false);
  assert.equal(
    model.topSignals.some((signal) => signal.id === "signature-readiness"),
    true,
  );
});

test("buildClinicalEncounterIntelligence does not create longitudinal warnings without memory", () => {
  const model = buildClinicalEncounterIntelligence(
    inputFixture({
      clinicalMemory: null,
      patientProfile: null,
      timeline: [],
    }),
  );

  assert.equal(model.sourceCounts.recurrentProblems, 0);
  assert.equal(model.sourceCounts.recurrentConsultations, 0);
  assert.equal(model.sourceCounts.recentChanges, 0);
  assert.equal(
    model.insights.some((signal) => signal.kind === "longitudinal_insight"),
    false,
  );
});

test("buildClinicalEncounterIntelligence prioritizes documented allergy as critical", () => {
  const profile = {
    allergies: [{ label: "Penicilina" }],
  } as PatientProfile;
  const model = buildClinicalEncounterIntelligence(
    inputFixture({ patientProfile: profile }),
  );

  assert.equal(model.sourceCounts.allergies, 1);
  assert.equal(model.topSignals[0]?.id, "allergy-documented");
  assert.equal(model.topSignals[0]?.severity, "critical");
});

test("buildClinicalEncounterIntelligence requires repeated evidence for recurrent problem", () => {
  const memory: PatientClinicalMemory = {
    ...emptyMemory,
    activeConditions: [
      { code: "I10", label: "Hipertensión arterial", source: "cie10" },
    ],
    recentDiagnoses: [
      { code: "I10", label: "Hipertensión arterial", source: "cie10" },
    ],
  };
  const model = buildClinicalEncounterIntelligence(
    inputFixture({ clinicalMemory: memory }),
  );

  assert.equal(model.sourceCounts.recurrentProblems, 1);
  assert.equal(
    model.insights.some((signal) => signal.id.includes("recurrent-problem")),
    true,
  );
});

test("buildClinicalEncounterIntelligence requires explicit consultation pattern", () => {
  const memory: PatientClinicalMemory = {
    ...emptyMemory,
    recentConsultations: [
      {
        id: "c1",
        createdAt: "2026-06-01",
        status: "completed",
        diagnosisCode: "R51",
        diagnosisLabel: "Cefalea",
      },
      {
        id: "c2",
        createdAt: "2026-06-15",
        status: "completed",
        diagnosisCode: "R51",
        diagnosisLabel: "Cefalea",
      },
    ],
  };
  const model = buildClinicalEncounterIntelligence(
    inputFixture({ clinicalMemory: memory }),
  );

  assert.equal(model.sourceCounts.recurrentConsultations, 1);
  assert.equal(
    model.insights.some((signal) => signal.id.includes("recurrent-consultation")),
    true,
  );
});

test("buildClinicalEncounterIntelligence keeps P2 rollback isolated from navigation model", () => {
  const navigationIntelligence = navigationFixture();
  const before = navigationIntelligence.progress.completionPercentage;
  buildClinicalEncounterIntelligence(inputFixture({ navigationIntelligence }));

  assert.equal(navigationIntelligence.progress.completionPercentage, before);
  assert.equal(navigationIntelligence.progress.signatureReady, true);
});
