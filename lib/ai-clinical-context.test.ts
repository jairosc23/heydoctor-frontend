import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClinicalAiContextPrompt,
  formatPatientDemographics,
  hashClinicalText,
} from "./ai-clinical-context";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const BASE_MEMORY: PatientClinicalMemory = {
  patientId: "p1",
  activeConditions: [
    { code: "E11.9", label: "DM2", source: "cie10" },
  ],
  recentDiagnoses: [],
  currentMedications: [{ name: "Metformina", prescriptionId: "r1", since: "" }],
  pendingLabs: [{ exam: "HbA1c 7.8%", labOrderId: "l1", orderedAt: "", status: "pending" }],
  alerts: [],
  recentConsultations: [],
};

describe("ai-clinical-context", () => {
  it("construye prompt con demografía, diagnóstico y memoria", () => {
    const prompt = buildClinicalAiContextPrompt({
      patientDemographics: "femenino, 52 años",
      activeDiagnosis: { code: "I10", description: "Hipertensión esencial" },
      chiefComplaint: "cefalea de 3 días",
      memory: BASE_MEMORY,
      allergyLines: ["Penicilina"],
      draftNotes: "Paciente refiere cefalea holocraneana.",
    });
    assert.match(prompt, /Paciente femenino, 52 años/);
    assert.match(prompt, /I10 Hipertensión esencial/);
    assert.match(prompt, /Metformina/);
    assert.match(prompt, /HbA1c 7.8%/);
    assert.match(prompt, /Penicilina/);
    assert.match(prompt, /cefalea de 3 días/);
  });

  it("formatea demografía del paciente", () => {
    assert.equal(
      formatPatientDemographics({ age: 52, sex: "femenino" }),
      "femenino, 52 años",
    );
  });

  it("genera hash estable por consulta y texto", () => {
    const a = hashClinicalText("c1", "notas", "I10");
    const b = hashClinicalText("c1", "notas", "I10");
    assert.equal(a, b);
  });
});
