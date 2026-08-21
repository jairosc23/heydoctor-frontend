import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createDiagnosis, parseDiagnosisLabel } from "./diagnosis";

describe("parseDiagnosisLabel", () => {
  it("parses CODE - description format", () => {
    assert.deepEqual(parseDiagnosisLabel("I10 - Hipertensión esencial"), {
      code: "I10",
      description: "Hipertensión esencial",
    });
  });

  it("returns null for free text without code prefix", () => {
    assert.equal(parseDiagnosisLabel("cefalea tensional"), null);
  });

  it("parses en-dash and em-dash separators", () => {
    assert.deepEqual(parseDiagnosisLabel("R51 – Cefalea"), {
      code: "R51",
      description: "Cefalea",
    });
    assert.deepEqual(parseDiagnosisLabel("R51 — Cefalea"), {
      code: "R51",
      description: "Cefalea",
    });
  });
});

describe("createDiagnosis", () => {
  it("requires consultationId", async () => {
    await assert.rejects(
      () =>
        createDiagnosis({
          consultationId: "  ",
          diagnostic_date: new Date().toISOString(),
          diagnosis_details: "J06.9 - Resfriado",
        }),
      /consultationId is required/,
    );
  });

  it("requires diagnosis_details", async () => {
    await assert.rejects(
      () =>
        createDiagnosis({
          consultationId: "c-1",
          diagnostic_date: new Date().toISOString(),
          diagnosis_details: "  ",
        }),
      /diagnosis_details is required/,
    );
  });
});
