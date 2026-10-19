import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildLongitudinalSummary,
  formatLongitudinalSummaryForContext,
  LONGITUDINAL_SUMMARY_LIMIT,
} from "./longitudinal-summary";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const MEMORY: PatientClinicalMemory = {
  patientId: "p1",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [
    {
      id: "c-current",
      createdAt: "2026-06-10T10:00:00.000Z",
      status: "draft",
      diagnosisCode: "I10",
      diagnosisLabel: "Hipertensión esencial",
    },
    {
      id: "c1",
      createdAt: "2026-05-01T10:00:00.000Z",
      status: "completed",
      diagnosisCode: "E11",
      diagnosisLabel: "DM2",
    },
    {
      id: "c2",
      createdAt: "2026-04-01T10:00:00.000Z",
      status: "completed",
      diagnosisCode: "J45",
      diagnosisLabel: "Asma",
    },
    {
      id: "c3",
      createdAt: "2026-03-01T10:00:00.000Z",
      status: "completed",
      diagnosisCode: "K21",
      diagnosisLabel: "ERGE",
    },
  ],
};

describe("longitudinal-summary", () => {
  it("limita a 3 consultas previas excluyendo la activa", () => {
    const summary = buildLongitudinalSummary(MEMORY, {
      currentConsultationId: "c-current",
    });
    assert.equal(summary.entries.length, LONGITUDINAL_SUMMARY_LIMIT);
    assert.ok(summary.entries.every((e) => e.consultationId !== "c-current"));
    assert.equal(summary.entries[0]?.consultationId, "c1");
  });

  it("formatea contexto longitudinal con fecha y diagnóstico", () => {
    const summary = buildLongitudinalSummary(MEMORY, {
      currentConsultationId: "c-current",
      maxEntries: 1,
    });
    const text = formatLongitudinalSummaryForContext(summary);
    assert.match(text ?? "", /Contexto clínico reciente/);
    assert.match(text ?? "", /E11/);
  });

  it("retorna vacío sin memoria", () => {
    const summary = buildLongitudinalSummary(null);
    assert.equal(summary.hasData, false);
    assert.equal(formatLongitudinalSummaryForContext(summary), null);
  });
});
