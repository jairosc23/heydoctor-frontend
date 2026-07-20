import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import { evaluatePreVisitQualitySignals } from "./pre-visit-quality-signals";

const MODULE_PATH = path.resolve(
  import.meta.dirname,
  "pre-visit-quality-signals.ts",
);

function foundationFixture(
  overrides?: Partial<ClinicalFoundationBundle>,
): ClinicalFoundationBundle {
  const base: ClinicalFoundationBundle = {
    meta: {
      version: "Clinical Foundation v1",
      schemaVersion: "1.0.0",
      generatedAt: "2026-07-19T00:00:00.000Z",
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
      displayName: "Ana Pérez",
      documentType: "RUT",
      documentNumber: "11.111.111-1",
      birthDate: "1990-01-01",
      sex: "F",
      email: "ana@example.com",
    },
    consultation: {
      id: "c1",
      status: "draft",
      reason: "Control HTA",
      diagnosisText: null,
      cie10: null,
      treatment: null,
      notes: null,
      doctorId: "d1",
      signedAt: null,
      isSigned: false,
      createdAt: "2026-07-19T10:00:00.000Z",
      updatedAt: "2026-07-19T10:00:00.000Z",
    },
    encounter: {
      chiefComplaint: null,
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      vitalSigns: { systolic: 120, diastolic: 80 },
      physicalExam: null,
      clinicalSummary: null,
    },
    memory: {
      patientId: "p1",
      activeConditions: [
        { code: "I10", label: "HTA", source: "cie10" },
      ],
      recentDiagnoses: [],
      currentMedications: [
        {
          name: "Losartán",
          prescriptionId: "rx1",
          since: "2026-01-01",
        },
      ],
      pendingLabs: [],
      alerts: [],
      recentConsultations: [],
    },
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
  return { ...base, ...overrides };
}

describe("EPIC-3 UC-02A pre-visit-quality-signals", () => {
  it("marks complete foundation fields as present", () => {
    const view = evaluatePreVisitQualitySignals(foundationFixture(), {
      evaluatedAt: "2026-07-19T12:00:00.000Z",
    });
    assert.equal(view.title, "Pre-Visit Quality Signals");
    assert.equal(view.generative, false);
    assert.equal(view.readOnly, true);
    const byId = Object.fromEntries(view.signals.map((s) => [s.id, s]));
    assert.equal(byId.motivo_consulta.status, "present");
    assert.equal(byId.antecedentes.status, "present");
    assert.equal(byId.medicamentos_habituales.status, "present");
    assert.equal(byId.signos_vitales.status, "present");
    assert.equal(byId.demografia.status, "present");
    assert.equal(byId.alergias.status, "unavailable");
  });

  it("marks missing motivo, antecedents, meds, vitals, demographics", () => {
    const view = evaluatePreVisitQualitySignals(
      foundationFixture({
        consultation: {
          ...foundationFixture().consultation,
          reason: null,
        },
        encounter: {
          ...foundationFixture().encounter,
          chiefComplaint: "   ",
          vitalSigns: {},
        },
        memory: {
          patientId: "p1",
          activeConditions: [],
          recentDiagnoses: [],
          currentMedications: [],
          pendingLabs: [],
          alerts: [],
          recentConsultations: [],
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
      }),
    );
    const byId = Object.fromEntries(view.signals.map((s) => [s.id, s]));
    assert.equal(byId.motivo_consulta.status, "missing");
    assert.equal(byId.antecedentes.status, "missing");
    assert.equal(byId.medicamentos_habituales.status, "missing");
    assert.equal(byId.signos_vitales.status, "missing");
    assert.equal(byId.demografia.status, "missing");
  });

  it("marks antecedents unavailable when memory not loaded", () => {
    const view = evaluatePreVisitQualitySignals(
      foundationFixture({
        bundleHealth: {
          memoryLoaded: false,
          intelligenceLoaded: false,
          prescriptionsLoaded: false,
          labsLoaded: false,
          referralsLoaded: false,
        },
        memory: null,
      }),
    );
    const byId = Object.fromEntries(view.signals.map((s) => [s.id, s]));
    assert.equal(byId.antecedentes.status, "unavailable");
    assert.equal(byId.medicamentos_habituales.status, "unavailable");
  });

  it("returns all unavailable when foundation is null", () => {
    const view = evaluatePreVisitQualitySignals(null);
    assert.ok(view.signals.every((s) => s.status === "unavailable"));
  });

  it("module source has no LLM / OpenAI / generative API calls", () => {
    const src = fs.readFileSync(MODULE_PATH, "utf8");
    const forbidden = [
      "openai",
      "consultation-assist",
      "consultation-summary",
      "generateDraft",
      "chat.completions",
      "heydoctorApi",
      "fetch(",
      "POST ",
      "PATCH ",
      "updateConsultation",
      "governed-",
    ];
    for (const token of forbidden) {
      assert.equal(
        src.toLowerCase().includes(token.toLowerCase()),
        false,
        `forbidden token present: ${token}`,
      );
    }
    assert.ok(src.includes("No LLM"));
    assert.ok(src.includes("no EMR writes"));
  });
});

