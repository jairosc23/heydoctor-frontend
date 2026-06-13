import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { humanizeAiClinicalError } from "./ai-clinical-errors";
import { ApiError } from "./heydoctor-api";
import {
  getAiResponseMetrics,
  recordAiResponseMetric,
  summarizeAiResponseMetrics,
} from "./ai-response-metrics";

describe("ai-clinical-errors", () => {
  it("oculta ThrottlerException al médico", () => {
    assert.equal(
      humanizeAiClinicalError(new ApiError("ThrottlerException", 429)),
      "La asistencia clínica se actualizará en unos segundos.",
    );
  });
});

describe("ai-response-metrics", () => {
  it("registra y resume métricas locales", () => {
    const before = getAiResponseMetrics().length;
    recordAiResponseMetric({
      kind: "enriched_documentation",
      durationMs: 1200,
      status: "success",
      responseLength: 450,
    });
    assert.ok(getAiResponseMetrics().length >= before + 1);
    const summary = summarizeAiResponseMetrics();
    assert.ok(summary.total >= 1);
    assert.ok(summary.avgDurationMs >= 0);
  });
});
