import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildSafetyEvaluateRequest,
  createHttpSafetyProvider,
  HttpSafetyProvider,
} from "./http-provider";

describe("HttpSafetyProvider", () => {
  it("exposes stable provider id", () => {
    assert.equal(new HttpSafetyProvider().id, "http-safety-provider-v1");
    assert.ok(createHttpSafetyProvider() instanceof HttpSafetyProvider);
  });

  it("builds safety-evaluate request from SafetyEvaluateInput lines", () => {
    const body = buildSafetyEvaluateRequest({
      patientId: "patient-1",
      consultationId: "consult-1",
      diagnosis: "IVRS",
      lines: [
        {
          lineIndex: 0,
          displayLabel: "Paracetamol 500 mg",
          drugPresentationId: "pres-1",
          dosage: "1 comprimido",
          frequency: "cada 8 horas",
          duration: "3 días",
          route: "oral",
        },
      ],
    });

    assert.deepEqual(body, {
      patientId: "patient-1",
      consultationId: "consult-1",
      cie10CodeId: undefined,
      diagnosis: "IVRS",
      medications: [
        {
          name: "Paracetamol 500 mg",
          drugPresentationId: "pres-1",
          dosage: "1 comprimido",
          frequency: "cada 8 horas",
          duration: "3 días",
          route: "oral",
          instructions: undefined,
        },
      ],
    });
  });
});
