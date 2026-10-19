import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContinuityContext } from "@/lib/continuity-platform/types";
import {
  createInitialContinuityPanelModel,
  reduceContinuityPanel,
} from "./continuity-panel-state";

function emptyCtx(patientId = "p1"): ContinuityContext {
  return {
    apiVersion: "pr9-ccp-v1",
    patientId,
    clinicId: "c1",
    assembledAt: "2026-07-26T00:00:00.000Z",
    activeMedications: [],
    timelineSummary: {
      window: { from: "2026-01-01", to: "2026-07-01" },
      events: [],
    },
    hints: [],
  };
}

function richCtx(): ContinuityContext {
  const base = emptyCtx();
  return {
    ...base,
    activeMedications: [
      {
        chainId: "ch1",
        versionId: "v1",
        medicationName: "Losartan",
        status: "active",
        issuedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  };
}

describe("PR-10 C1 Continuity Panel state machine", () => {
  it("I1: OPEN → CACHE_MISS → Loading → FETCH_SUCCESS Empty", () => {
    let s = createInitialContinuityPanelModel("p1", "e1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    assert.equal(s.uiState, "Opening");
    assert.equal(s.generationId, 1);
    s = reduceContinuityPanel(s, { type: "CACHE_MISS" });
    assert.equal(s.uiState, "Loading");
    s = reduceContinuityPanel(s, { type: "FETCH_SUCCESS", context: emptyCtx() });
    assert.equal(s.uiState, "Empty");
  });

  it("I1: OPEN → CACHE_HIT → Refreshing → Loaded", () => {
    let s = createInitialContinuityPanelModel("p1", "e1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, { type: "CACHE_HIT", context: richCtx() });
    assert.equal(s.uiState, "Refreshing");
    assert.equal(s.context?.activeMedications.length, 1);
    s = reduceContinuityPanel(s, { type: "FETCH_SUCCESS", context: richCtx() });
    assert.equal(s.uiState, "Loaded");
  });

  it("DISMISS during Loading → Dismissed + gen bump", () => {
    let s = createInitialContinuityPanelModel("p1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, { type: "CACHE_MISS" });
    const gen = s.generationId;
    s = reduceContinuityPanel(s, { type: "DISMISS" });
    assert.equal(s.uiState, "Dismissed");
    assert.equal(s.generationId, gen + 1);
  });

  it("REOPEN from Dismissed → Opening", () => {
    let s = createInitialContinuityPanelModel("p1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, { type: "CACHE_MISS" });
    s = reduceContinuityPanel(s, { type: "DISMISS" });
    s = reduceContinuityPanel(s, { type: "REOPEN" });
    assert.equal(s.uiState, "Opening");
  });

  it("Refreshing FETCH_ERROR keeps Loaded + softError", () => {
    let s = createInitialContinuityPanelModel("p1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, { type: "CACHE_MISS" });
    s = reduceContinuityPanel(s, { type: "FETCH_SUCCESS", context: richCtx() });
    s = reduceContinuityPanel(s, { type: "REFRESH" });
    assert.equal(s.uiState, "Refreshing");
    s = reduceContinuityPanel(s, {
      type: "FETCH_ERROR",
      error: { code: "network" },
    });
    assert.equal(s.uiState, "Loaded");
    assert.equal(s.softError?.code, "network");
    assert.ok(s.context);
  });

  it("PATIENT_CHANGE resets to Closed", () => {
    let s = createInitialContinuityPanelModel("p1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, {
      type: "PATIENT_CHANGE",
      patientId: "p2",
      encounterId: "e2",
    });
    assert.equal(s.uiState, "Closed");
    assert.equal(s.patientId, "p2");
    assert.equal(s.generationId, 0);
    assert.equal(s.context, null);
  });

  it("I2: no FETCH_EMPTY — empty only via FETCH_SUCCESS", () => {
    let s = createInitialContinuityPanelModel("p1");
    s = reduceContinuityPanel(s, { type: "OPEN" });
    s = reduceContinuityPanel(s, { type: "CACHE_MISS" });
    s = reduceContinuityPanel(s, { type: "FETCH_SUCCESS", context: emptyCtx() });
    assert.equal(s.uiState, "Empty");
    s = reduceContinuityPanel(s, { type: "REFRESH" });
    s = reduceContinuityPanel(s, { type: "FETCH_SUCCESS", context: richCtx() });
    assert.equal(s.uiState, "Loaded");
  });
});
