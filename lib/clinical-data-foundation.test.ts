import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClinicalDataFoundation,
  clinicalDataFoundationHasContent,
  formatClinicalDataFoundationPrompt,
} from "./clinical-data-foundation";
import type { PatientClinicalMemory } from "./types/clinical-memory";

describe("clinical-data-foundation", () => {
  it("agrega vitales, examen y longitudinal en un solo bloque", () => {
    const memory: PatientClinicalMemory = {
      patientId: "p1",
      activeConditions: [],
      recentDiagnoses: [],
      currentMedications: [],
      pendingLabs: [],
      alerts: [],
      recentConsultations: [
        {
          id: "prev",
          createdAt: "2026-05-01T00:00:00.000Z",
          status: "completed",
          diagnosisCode: "I10",
          diagnosisLabel: "HTA",
        },
      ],
    };

    const foundation = buildClinicalDataFoundation({
      encounterNotes: "PA 140/90 mmHg. FC 72 lpm.",
      memory,
      currentConsultationId: "current",
    });

    const prompt = formatClinicalDataFoundationPrompt(foundation);
    assert.ok(clinicalDataFoundationHasContent(foundation));
    assert.match(prompt, /Signos vitales/);
    assert.match(prompt, /140\/90/);
    assert.match(prompt, /Contexto clínico reciente/);
  });
});
