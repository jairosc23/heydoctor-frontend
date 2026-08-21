import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildUpdateConsultationBody, unwrapConsultation } from "./consultations";

describe("buildUpdateConsultationBody", () => {
  it("maps chiefComplaint to reason and treatmentPlan to treatment", () => {
    assert.deepEqual(
      buildUpdateConsultationBody({
        chiefComplaint: "tos seca",
        treatmentPlan: "reposo",
        diagnosis: "J06.9",
      }),
      {
        reason: "tos seca",
        treatment: "reposo",
        diagnosis: "J06.9",
      },
    );
  });

  it("prefers explicit treatment over treatmentPlan", () => {
    assert.deepEqual(
      buildUpdateConsultationBody({
        treatment: "plan-a",
        treatmentPlan: "plan-b",
      }),
      { treatment: "plan-a" },
    );
  });

  it("includes cie10CodeId when provided", () => {
    assert.deepEqual(
      buildUpdateConsultationBody({
        diagnosis: "I10 - Hipertensión esencial",
        cie10CodeId: "550e8400-e29b-41d4-a716-446655440000",
      }),
      {
        diagnosis: "I10 - Hipertensión esencial",
        cie10CodeId: "550e8400-e29b-41d4-a716-446655440000",
      },
    );
  });

  it("allows null cie10CodeId to unlink structured diagnosis", () => {
    assert.deepEqual(
      buildUpdateConsultationBody({
        diagnosis: "Texto libre",
        cie10CodeId: null,
      }),
      {
        diagnosis: "Texto libre",
        cie10CodeId: null,
      },
    );
  });
});

describe("unwrapConsultation", () => {
  it("returns a bare consultation entity", () => {
    const raw = { id: "c1", doctorSignature: "iVBOR", status: "signed" };
    assert.equal(unwrapConsultation(raw).doctorSignature, "iVBOR");
  });

  it("unwraps a { data } envelope without dropping the signature", () => {
    const raw = {
      data: { id: "c1", doctorSignature: "iVBOR", status: "signed" },
    };
    assert.equal(unwrapConsultation(raw).id, "c1");
    assert.equal(unwrapConsultation(raw).doctorSignature, "iVBOR");
  });
});
