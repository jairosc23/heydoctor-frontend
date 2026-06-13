import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildConsultationSummaryRequest,
} from "./services/ai-clinical";
import { buildClinicalAiContextPrompt } from "./ai-clinical-context";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const MEMORY: PatientClinicalMemory = {
  patientId: "p1",
  activeConditions: [{ code: "I10", label: "HTA", source: "cie10" }],
  recentDiagnoses: [],
  currentMedications: [{ name: "Losartán", prescriptionId: "r1", since: "" }],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

describe("consultation-summary v2 payload", () => {
  it("buildConsultationSummaryRequest incluye clientSnapshot enriquecido", () => {
    const req = buildConsultationSummaryRequest({
      consultationId: "c1",
      chiefComplaint: "cefalea",
      draftNotes: "PA 140/90 mmHg. Cefalea holocraneana.",
      treatment: "Continuar losartán",
      patientAge: 58,
      patientSex: "masculino",
      activeDiagnosis: { code: "I10", description: "Hipertensión esencial" },
      memory: MEMORY,
      currentConsultationId: "c1",
    });

    assert.equal(req.consultationId, "c1");
    assert.ok(req.clientSnapshot?.clinicalContextPrompt);
    assert.match(req.clientSnapshot.clinicalContextPrompt, /Signos vitales/);
    assert.match(req.clientSnapshot.clinicalContextPrompt, /140\/90/);
    assert.match(req.clientSnapshot.clinicalContextPrompt, /Losartán/);
    assert.equal(req.clientSnapshot.draftNotes, "PA 140/90 mmHg. Cefalea holocraneana.");
    assert.equal(req.clientSnapshot.patientAge, "58");
  });

  it("clinicalContextPrompt coincide con buildClinicalAiContextPrompt", () => {
    const input = {
      consultationId: "c2",
      chiefComplaint: "control HbA1c",
      draftNotes: "HbA1c 8.2%",
      activeDiagnosis: { code: "E11", description: "DM2" },
      memory: MEMORY,
    };
    const req = buildConsultationSummaryRequest(input);
    const direct = buildClinicalAiContextPrompt({
      ...input,
      encounterNotes: input.draftNotes,
      currentConsultationId: "c2",
    });
    assert.equal(req.clientSnapshot?.clinicalContextPrompt, direct);
  });
});
