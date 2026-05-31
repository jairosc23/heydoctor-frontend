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
});
