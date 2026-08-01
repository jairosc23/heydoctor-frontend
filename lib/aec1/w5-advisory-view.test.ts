import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatW5Explainability,
  formatW5PriorityLabel,
  formatW5Provenance,
  resolveW5AdvisoryUiState,
  sortW5InsightsForAssist,
} from "./w5-advisory-view";

describe("AEC-1 M5 W5 advisory view helpers", () => {
  it("resolves fail-closed UI states", () => {
    assert.equal(
      resolveW5AdvisoryUiState({ loading: true, response: null }),
      "loading",
    );
    assert.equal(
      resolveW5AdvisoryUiState({
        loading: false,
        response: { code: "W5_FLAG_OR_AUTHORITY_DENIED", insights: [] },
      }),
      "forbidden",
    );
    assert.equal(
      resolveW5AdvisoryUiState({
        loading: false,
        response: { code: "W5_CLINICAL_ERROR", insights: [] },
      }),
      "error",
    );
    assert.equal(
      resolveW5AdvisoryUiState({
        loading: false,
        response: { insights: [] },
      }),
      "empty",
    );
    assert.equal(
      resolveW5AdvisoryUiState({
        loading: false,
        response: { insights: [{ id: "a" }] },
      }),
      "advisory",
    );
  });

  it("sorts by priority/score without inventing values", () => {
    const sorted = sortW5InsightsForAssist([
      { id: "low", priority: 1 },
      { id: "high", priority: 90 },
      { id: "mid", score: 40 },
    ]);
    assert.deepEqual(
      sorted.map((i) => i.id),
      ["high", "mid", "low"],
    );
  });

  it("formats optional explainability and provenance only when present", () => {
    assert.equal(formatW5PriorityLabel({ id: "x" }), null);
    assert.equal(formatW5PriorityLabel({ id: "x", priority: 12 }), "12");
    assert.equal(
      formatW5Explainability({
        id: "x",
        explainability: { summary: "Rule hit", reasons: ["A1", "B2"] },
      }),
      "Rule hit — A1; B2",
    );
    assert.equal(
      formatW5Provenance({
        id: "x",
        provenance: { source: "rule-engine", ruleId: "R-9" },
      }),
      "rule-engine · R-9",
    );
  });
});
