import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { NestConsultation } from "@/lib/services/consultations";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import {
  evaluateLiveDocumentationQuality,
  labelDocQualityStatus,
} from "./live-documentation-quality";

const MODULE = path.resolve(
  import.meta.dirname,
  "live-documentation-quality.ts",
);

function foundationComplete(): ClinicalFoundationBundle {
  return {
    meta: {
      version: "Clinical Foundation v1",
      schemaVersion: "1.0.0",
      generatedAt: "2026-07-19T12:00:00.000Z",
    },
    bundleHealth: {
      memoryLoaded: true,
      intelligenceLoaded: true,
      prescriptionsLoaded: true,
      labsLoaded: true,
      referralsLoaded: true,
    },
    patient: {
      id: "p1",
      displayName: "Ana",
      documentType: null,
      documentNumber: null,
      birthDate: null,
      sex: null,
      email: null,
    },
    consultation: {
      id: "c1",
      status: "in_progress",
      reason: "Control",
      diagnosisText: "HTA",
      cie10: { code: "I10", description: "HTA", cie10CodeId: null },
      treatment: "Losartán",
      notes: "S: cefalea",
      doctorId: "d1",
      signedAt: null,
      isSigned: false,
      createdAt: "2026-07-19T10:00:00.000Z",
      updatedAt: "2026-07-19T11:00:00.000Z",
    },
    encounter: {
      chiefComplaint: "Control",
      subjective: "Cefalea",
      objective: "Examen normal",
      assessment: "HTA",
      plan: "Continuar Rx",
      vitalSigns: { hr: 70 },
      physicalExam: { general: "ok" },
      clinicalSummary: null,
    },
    memory: null,
    orders: { prescriptions: [], labs: [], referrals: [] },
    intelligence: null,
    provenance: [],
    outputs: null,
    drafts: {
      certificate: null,
      referral: null,
      prescription: null,
      clinicalReport: null,
    },
  };
}

describe("EPIC-3 UC-03B live-documentation-quality", () => {
  it("labels statuses in Spanish", () => {
    assert.equal(labelDocQualityStatus("completed"), "Completado");
    assert.equal(labelDocQualityStatus("pending"), "Pendiente");
    assert.equal(labelDocQualityStatus("unavailable"), "No disponible");
  });

  it("marks complete documentation when fields are present", () => {
    const consultation: NestConsultation = {
      id: "c1",
      consentGivenAt: "2026-07-19T10:01:00.000Z",
      consentVersion: "v1",
      signedAt: "2026-07-19T12:00:00.000Z",
    };
    const view = evaluateLiveDocumentationQuality({
      consultation,
      foundation: foundationComplete(),
      evaluatedAt: "2026-07-19T12:00:00.000Z",
    });
    assert.equal(view.phase, "live");
    assert.equal(view.generative, false);
    assert.equal(view.persistsToEmr, false);
    const byId = Object.fromEntries(view.indicators.map((i) => [i.id, i]));
    assert.equal(byId.soap?.status, "completed");
    assert.equal(byId.motivo_consulta?.status, "completed");
    assert.equal(byId.examen_fisico?.status, "completed");
    assert.equal(byId.signos_vitales?.status, "completed");
    assert.equal(byId.diagnostico?.status, "completed");
    assert.equal(byId.plan_terapeutico?.status, "completed");
    assert.equal(byId.consentimiento?.status, "completed");
    assert.equal(byId.firma?.status, "completed");
  });

  it("marks pending SOAP / consent / signature when incomplete", () => {
    const foundation = foundationComplete();
    foundation.encounter.subjective = null;
    foundation.encounter.objective = null;
    foundation.encounter.assessment = null;
    foundation.encounter.plan = null;
    foundation.encounter.vitalSigns = null;
    foundation.encounter.physicalExam = null;
    foundation.consultation.diagnosisText = null;
    foundation.consultation.cie10 = null;
    foundation.consultation.treatment = null;
    foundation.consultation.notes = null;
    foundation.consultation.reason = null;
    foundation.encounter.chiefComplaint = null;

    const view = evaluateLiveDocumentationQuality({
      consultation: { id: "c1" },
      foundation,
    });
    const byId = Object.fromEntries(view.indicators.map((i) => [i.id, i]));
    assert.equal(byId.soap?.status, "pending");
    assert.equal(byId.motivo_consulta?.status, "pending");
    assert.equal(byId.examen_fisico?.status, "pending");
    assert.equal(byId.signos_vitales?.status, "pending");
    assert.equal(byId.diagnostico?.status, "pending");
    assert.equal(byId.plan_terapeutico?.status, "pending");
    assert.equal(byId.consentimiento?.status, "pending");
    assert.equal(byId.firma?.status, "pending");
  });

  it("module has no LLM / EMR write surface", () => {
    const src = fs.readFileSync(MODULE, "utf8");
    for (const token of [
      "openai",
      "consultation-assist",
      "getConsultationAssist",
      "heydoctorApi",
      "updateConsultation",
      "governed-",
      "fetch(",
    ]) {
      assert.equal(src.includes(token), false, `forbidden: ${token}`);
    }
    assert.ok(src.includes("No LLM"));
  });
});
