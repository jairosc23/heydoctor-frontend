import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildClinicalMemoryView,
  clinicalMemoryConfidenceLabel,
} from "./clinical-memory";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

const BASE: PatientClinicalMemory = {
  patientId: "p1",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

describe("buildClinicalMemoryView", () => {
  it("genera categorías determinísticas de memoria clínica", () => {
    const view = buildClinicalMemoryView({
      memory: {
        ...BASE,
        activeConditions: [
          {
            code: "E11.9",
            label: "Diabetes mellitus tipo 2",
            source: "cie10",
          },
        ],
        currentMedications: [
          {
            name: "Metformina",
            prescriptionId: "rx1",
            since: new Date().toISOString(),
          },
        ],
        recentConsultations: [
          { id: "c1", createdAt: "", status: "completed", diagnosisCode: "E11.9", diagnosisLabel: "DM2" },
          { id: "c2", createdAt: "", status: "completed", diagnosisCode: "E11.9", diagnosisLabel: "DM2" },
          { id: "c3", createdAt: "", status: "completed", diagnosisCode: "E11.9", diagnosisLabel: "DM2" },
        ],
      },
    });

    assert.match(view.categories.predominantDiagnosis, /Diabetes mellitus tipo 2/);
    assert.equal(view.categories.carePattern, "Seguimiento longitudinal activo");
    assert.match(view.categories.treatment, /metformina/i);
    assert.match(view.categories.recentActivity, /3 consultas/);
    assert.equal(view.categories.risk, "Riesgo crítico no identificado");
    assert.equal(view.confidence, "alta");
    assert.equal(view.highlights.length, 5);
  });

  it("expone etiqueta de confianza legible", () => {
    assert.equal(clinicalMemoryConfidenceLabel("alta"), "Alta");
    assert.equal(clinicalMemoryConfidenceLabel("baja"), "Baja");
  });
});
