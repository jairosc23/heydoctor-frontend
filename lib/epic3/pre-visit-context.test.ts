import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import {
  buildPreVisitContextView,
  labelConsultationStatus,
} from "./pre-visit-context";

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
      intelligenceLoaded: false,
      prescriptionsLoaded: true,
      labsLoaded: false,
      referralsLoaded: false,
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
      chiefComplaint: "Cefalea",
      subjective: null,
      objective: null,
      assessment: null,
      plan: null,
      vitalSigns: null,
      physicalExam: null,
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
    ...overrides,
  };
}

describe("EPIC-3 UC-01 pre-visit-context", () => {
  it("labels consultation status", () => {
    assert.equal(labelConsultationStatus("draft"), "Borrador");
    assert.equal(labelConsultationStatus("in_progress"), "En curso");
  });

  it("prefers agenda reason over foundation", () => {
    const view = buildPreVisitContextView({
      foundation: foundationFixture(),
      agenda: {
        appointmentId: "a1",
        reason: "Motivo agenda",
        startsAt: "2026-07-20T15:00:00.000Z",
        status: "CONFIRMED",
      },
    });
    assert.equal(view.motivo, "Motivo agenda");
    assert.equal(view.motivoSource, "agenda");
    assert.equal(view.phase, "prep");
    assert.equal(view.readOnly, true);
    assert.equal(view.patient?.displayName, "Ana Pérez");
    assert.equal(view.encounter?.statusLabel, "Borrador");
  });

  it("falls back to foundation reason then chief complaint", () => {
    const withReason = buildPreVisitContextView({
      foundation: foundationFixture(),
    });
    assert.equal(withReason.motivoSource, "foundation_reason");
    assert.equal(withReason.motivo, "Control HTA");

    const onlyChief = buildPreVisitContextView({
      foundation: foundationFixture({
        consultation: {
          ...foundationFixture().consultation,
          reason: null,
        },
      }),
    });
    assert.equal(onlyChief.motivoSource, "foundation_chief_complaint");
    assert.equal(onlyChief.motivo, "Cefalea");
  });

  it("handles missing foundation without throwing", () => {
    const view = buildPreVisitContextView({
      foundation: null,
      foundationError: "timeout",
    });
    assert.equal(view.foundationReady, false);
    assert.equal(view.foundationError, "timeout");
    assert.equal(view.motivoSource, "unavailable");
    assert.equal(view.patient, null);
  });
});
