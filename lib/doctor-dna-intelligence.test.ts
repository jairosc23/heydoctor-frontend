import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildActivityNarrative,
  buildClinicalProfile,
  buildClinicalSignature,
  buildDoctorDnaIntelligenceView,
  buildPersistentChipLabel,
  buildTrendLines,
  inferTrendDirection,
} from "./doctor-dna-intelligence";
import type { DoctorDnaProfile } from "./types/doctor-dna";

const BASE: DoctorDnaProfile = {
  doctorId: "d1",
  topDiagnoses: [],
  topMedications: [],
  topLabs: [],
  topFollowUps: [],
  practiceMetrics: {
    consultations30d: 0,
    prescriptions30d: 0,
    labOrders30d: 0,
    uniquePatients30d: 0,
    generatedAt: new Date().toISOString(),
  },
};

describe("buildActivityNarrative", () => {
  it("usa frases clínicas contextualizadas con pluralización", () => {
    const lines = buildActivityNarrative({
      consultations30d: 31,
      uniquePatients30d: 6,
      prescriptions30d: 5,
      labOrders30d: 1,
      generatedAt: "",
    });
    assert.match(lines[0]!.text, /31 consultas últimos 30 días/);
    assert.match(lines[1]!.text, /6 pacientes activos/);
    assert.match(lines[3]!.text, /1 laboratorio solicitado/);
  });
});

describe("buildClinicalProfile", () => {
  it("detecta predominio crónico y área metabólica", () => {
    const profile = buildClinicalProfile({
      ...BASE,
      topDiagnoses: [
        {
          id: "1",
          code: "E11.9",
          label: "Diabetes mellitus tipo 2",
          frequency: 8,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.8,
        },
        {
          id: "2",
          code: "I10",
          label: "Hipertensión arterial",
          frequency: 5,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.6,
        },
      ],
      practiceMetrics: {
        ...BASE.practiceMetrics,
        consultations30d: 31,
        prescriptions30d: 20,
        uniquePatients30d: 6,
      },
    });
    assert.equal(profile.predominance, "Enfermedad crónica");
    assert.equal(profile.mainArea, "Control metabólico");
  });
});

describe("buildTrendLines", () => {
  it("marca el diagnóstico líder como tendencia al alza", () => {
    const ref = Date.now();
    const trends = buildTrendLines(
      [
        {
          id: "dx1",
          code: "E11.9",
          label: "Diabetes mellitus tipo 2",
          frequency: 10,
          lastUsedAt: new Date(ref).toISOString(),
          preferenceScore: 0.9,
        },
      ],
      1,
    );
    assert.equal(trends[0]?.direction, "up");
    assert.equal(
      inferTrendDirection(
        {
          id: "dx1",
          code: "E11.9",
          label: "Diabetes mellitus tipo 2",
          frequency: 10,
          lastUsedAt: new Date(ref).toISOString(),
          preferenceScore: 0.9,
        },
        0,
        ref,
      ),
      "up",
    );
  });
});

describe("buildClinicalSignature", () => {
  it("genera firma clínica sin métricas expuestas como scores", () => {
    const signature = buildClinicalSignature({
      ...BASE,
      topDiagnoses: [
        {
          id: "1",
          code: "E11.9",
          label: "Diabetes mellitus tipo 2",
          frequency: 8,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.8,
        },
      ],
      topFollowUps: [
        {
          diagnosisCode: "E11.9",
          diagnosisLabel: "DM2",
          intervalDays: 90,
          frequency: 3,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.7,
        },
      ],
      practiceMetrics: {
        consultations30d: 20,
        prescriptions30d: 12,
        labOrders30d: 4,
        uniquePatients30d: 6,
        generatedAt: new Date().toISOString(),
      },
    });
    assert.equal(signature.predominance, "Control metabólico");
    assert.ok(signature.style.length > 0);
    assert.ok(signature.profile.includes("crónica") || signature.profile.length > 0);
    assert.ok(buildPersistentChipLabel(signature).length > 0);
  });
});

describe("buildDoctorDnaIntelligenceView", () => {
  it("compone todas las secciones del drawer", () => {
    const view = buildDoctorDnaIntelligenceView({
      ...BASE,
      topDiagnoses: [
        {
          id: "1",
          code: "J45.9",
          label: "Asma",
          frequency: 3,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.5,
        },
      ],
      topMedications: [
        {
          id: "m1",
          label: "Metformina",
          frequency: 4,
          lastUsedAt: new Date().toISOString(),
          preferenceScore: 0.7,
        },
      ],
      practiceMetrics: {
        consultations30d: 10,
        prescriptions30d: 8,
        labOrders30d: 2,
        uniquePatients30d: 4,
        generatedAt: new Date().toISOString(),
      },
    });
    assert.equal(view.activity.length, 4);
    assert.equal(view.dominantDiagnoses[0]?.display, "J45.9 Asma");
    assert.equal(view.topMedications[0]?.label, "Metformina");
    assert.ok(view.trends.length >= 1);
    assert.ok(view.signature.predominance);
    assert.ok(view.physicianTraits.length >= 1);
    assert.equal(view.rankedPathologies[0]?.medal, "🥇");
    assert.ok(view.frequentInterventions.length >= 1);
    assert.ok(view.observations.length >= 1);
    assert.ok(view.persistentChipLabel.length > 0);
  });
});
