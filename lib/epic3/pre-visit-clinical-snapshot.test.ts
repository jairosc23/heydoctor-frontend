import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import { buildPreVisitClinicalSnapshot } from "./pre-visit-clinical-snapshot";

const MODULE = path.resolve(
  import.meta.dirname,
  "pre-visit-clinical-snapshot.ts",
);

function foundationFixture(
  overrides?: Partial<ClinicalFoundationBundle>,
): ClinicalFoundationBundle {
  return {
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
      documentNumber: "1-1",
      birthDate: "1990-01-01",
      sex: "F",
      email: null,
    },
    consultation: {
      id: "c1",
      status: "draft",
      reason: "Control",
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
      activeConditions: [{ code: "I10", label: "HTA", source: "cie10" }],
      recentDiagnoses: [
        { code: "J06.9", label: "IVRS", source: "cie10", lastSeenAt: "2026-06-01" },
      ],
      currentMedications: [
        {
          name: "Losartán",
          dosage: "50mg",
          frequency: "1-0-0",
          prescriptionId: "rx1",
          since: "2026-01-01",
        },
      ],
      pendingLabs: [
        {
          exam: "Creatinina",
          labOrderId: "lab1",
          orderedAt: "2026-07-01",
          status: "pending",
        },
      ],
      alerts: [],
      recentConsultations: [
        {
          id: "c0",
          createdAt: "2026-06-01",
          status: "signed",
          diagnosisCode: "J06.9",
          diagnosisLabel: "IVRS",
        },
      ],
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
    ...overrides,
  };
}

describe("EPIC-3 UC-02C pre-visit-clinical-snapshot", () => {
  it("projects foundation fields without inventing content", () => {
    const view = buildPreVisitClinicalSnapshot(foundationFixture(), {
      evaluatedAt: "2026-07-19T12:00:00.000Z",
    });
    assert.equal(view.title, "Pre-Visit Clinical Snapshot");
    assert.equal(view.generative, false);
    assert.equal(view.persistsToEmr, false);
    assert.equal(view.patientLabel, "Ana Pérez");
    const byId = Object.fromEntries(view.sections.map((s) => [s.id, s]));
    assert.equal(byId.problemas_activos?.availability, "has_data");
    assert.match(byId.problemas_activos?.lines[0]?.text ?? "", /HTA/);
    assert.equal(byId.diagnosticos_recientes?.availability, "has_data");
    assert.equal(byId.medicacion_habitual?.availability, "has_data");
    assert.equal(byId.signos_vitales?.availability, "has_data");
    assert.ok(
      byId.signos_vitales?.lines.some((l) => l.text.includes("systolic")),
    );
    assert.equal(byId.examenes?.availability, "has_data");
    assert.equal(byId.consultas_recientes?.availability, "has_data");
    assert.equal(byId.alergias?.availability, "unavailable");
  });

  it("marks empty sections when memory loaded but arrays empty", () => {
    const view = buildPreVisitClinicalSnapshot(
      foundationFixture({
        encounter: {
          ...foundationFixture().encounter,
          vitalSigns: null,
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
      }),
    );
    const byId = Object.fromEntries(view.sections.map((s) => [s.id, s]));
    assert.equal(byId.problemas_activos?.availability, "empty");
    assert.equal(byId.signos_vitales?.availability, "empty");
  });

  it("returns unavailable sections when foundation is null", () => {
    const view = buildPreVisitClinicalSnapshot(null);
    assert.equal(view.foundationReady, false);
    assert.ok(view.sections.every((s) => s.availability === "unavailable"));
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
    assert.ok(src.includes("no EMR writes"));
  });
});
