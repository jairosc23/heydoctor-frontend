import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_ASSIST_UNAVAILABLE_COPY,
  humanizeAiClinicalError,
  toAiClinicalUserMessage,
} from "./ai-clinical-errors";
import { ApiError } from "./heydoctor-api";
import {
  getAiResponseMetrics,
  recordAiResponseMetric,
  summarizeAiResponseMetrics,
} from "./ai-response-metrics";
import { Rc5FeTimeoutError } from "./medical-copilot/rc5-operational/resilience";

describe("ai-clinical-errors", () => {
  it("oculta ThrottlerException al médico", () => {
    assert.equal(
      humanizeAiClinicalError(new ApiError("ThrottlerException", 429)),
      "La asistencia clínica se actualizará en unos segundos.",
    );
  });

  it("maps RC5 FE timeout to friendly NON_AUTHORITY copy", () => {
    const err = new Rc5FeTimeoutError("/api/medical-copilot/foo", 20000);
    assert.equal(humanizeAiClinicalError(err), AI_ASSIST_UNAVAILABLE_COPY);
    const ui = toAiClinicalUserMessage(err);
    assert.equal(ui, AI_ASSIST_UNAVAILABLE_COPY);
    assert.doesNotMatch(ui, /RC5|20000|\/api\//);
  });

  it("never surfaces raw timeout strings", () => {
    const ui = toAiClinicalUserMessage("RC5 FE timeout 20000ms: /x");
    assert.equal(ui, AI_ASSIST_UNAVAILABLE_COPY);
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
