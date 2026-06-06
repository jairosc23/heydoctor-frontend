import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildUpdateConsultationBody } from "./consultations";

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
