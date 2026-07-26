import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createInitialContinuityPanelModel } from "./continuity-panel-state";
import { shouldDiscardFetchResult } from "./continuity-panel-fetch";
import { reduceContinuityPanel } from "./continuity-panel-state";

describe("PR-10 C1 ContinuityPanelFetch discard", () => {
  it("discards stale generationId", () => {
    let model = createInitialContinuityPanelModel("p1");
    model = reduceContinuityPanel(model, { type: "OPEN" });
    const ac = new AbortController();
    const job = {
      generationId: model.generationId,
      patientId: "p1",
      encounterId: null,
      signal: ac.signal,
    };
    model = reduceContinuityPanel(model, { type: "DISMISS" });
    assert.equal(shouldDiscardFetchResult(model, job), true);
  });

  it("discards aborted signal", () => {
    let model = createInitialContinuityPanelModel("p1");
    model = reduceContinuityPanel(model, { type: "OPEN" });
    model = reduceContinuityPanel(model, { type: "CACHE_MISS" });
    const ac = new AbortController();
    ac.abort();
    assert.equal(
      shouldDiscardFetchResult(model, {
        generationId: model.generationId,
        patientId: "p1",
        signal: ac.signal,
      }),
      true,
    );
  });

  it("discards wrong patientId", () => {
    let model = createInitialContinuityPanelModel("p1");
    model = reduceContinuityPanel(model, { type: "OPEN" });
    model = reduceContinuityPanel(model, { type: "CACHE_MISS" });
    const ac = new AbortController();
    assert.equal(
      shouldDiscardFetchResult(model, {
        generationId: model.generationId,
        patientId: "p-other",
        signal: ac.signal,
      }),
      true,
    );
  });

  it("accepts matching in-flight Loading job", () => {
    let model = createInitialContinuityPanelModel("p1");
    model = reduceContinuityPanel(model, { type: "OPEN" });
    model = reduceContinuityPanel(model, { type: "CACHE_MISS" });
    const ac = new AbortController();
    assert.equal(
      shouldDiscardFetchResult(model, {
        generationId: model.generationId,
        patientId: "p1",
        signal: ac.signal,
      }),
      false,
    );
  });
});
