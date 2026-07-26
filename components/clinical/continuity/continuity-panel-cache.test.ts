import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import type { ContinuityContext } from "@/lib/continuity-platform/types";
import {
  CONTINUITY_PANEL_CACHE_TTL_MS,
  buildContinuityCacheKey,
  clearAllContinuityPanelCache,
  continuityCacheSize,
  destroyContinuityCacheForPatient,
  putContinuityCache,
  readContinuityCache,
} from "./continuity-panel-cache";

function ctx(patientId: string): ContinuityContext {
  return {
    apiVersion: "pr9-ccp-v1",
    patientId,
    clinicId: "c1",
    assembledAt: "2026-07-26T00:00:00.000Z",
    activeMedications: [],
    timelineSummary: {
      window: { from: "a", to: "b" },
      events: [],
    },
    hints: [],
  };
}

describe("PR-10 C1 Continuity Panel cache", () => {
  beforeEach(() => {
    clearAllContinuityPanelCache();
  });

  it("I3: TTL is fixed 5 minutes", () => {
    assert.equal(CONTINUITY_PANEL_CACHE_TTL_MS, 5 * 60 * 1000);
  });

  it("isolates patients and encounters", () => {
    putContinuityCache("p1", "e1", ctx("p1"));
    putContinuityCache("p1", "e2", ctx("p1"));
    putContinuityCache("p2", "e1", ctx("p2"));
    assert.equal(buildContinuityCacheKey("p1", "e1"), "p1::e1");
    assert.ok(readContinuityCache("p1", "e1"));
    assert.ok(readContinuityCache("p1", "e2"));
    assert.equal(readContinuityCache("p1", "e1")?.patientId, "p1");
    destroyContinuityCacheForPatient("p1");
    assert.equal(readContinuityCache("p1", "e1"), null);
    assert.equal(readContinuityCache("p1", "e2"), null);
    assert.ok(readContinuityCache("p2", "e1"));
  });

  it("expires after TTL", () => {
    const now = 1_000_000;
    putContinuityCache("p1", null, ctx("p1"), now);
    assert.ok(readContinuityCache("p1", null, now + 1000));
    assert.equal(
      readContinuityCache("p1", null, now + CONTINUITY_PANEL_CACHE_TTL_MS + 1),
      null,
    );
    assert.equal(continuityCacheSize(), 0);
  });
});
