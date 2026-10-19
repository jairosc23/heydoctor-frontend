import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  applyEncounterMemoryPatch,
  createEmptyEncounterMemory,
} from "./create-encounter-memory";

describe("Encounter Memory SSOT (P0 minimal)", () => {
  it("creates empty in-encounter memory", () => {
    const m = createEmptyEncounterMemory({
      consultationId: "c1",
      patientId: "p1",
    });
    assert.equal(m.consultationId, "c1");
    assert.equal(m.patientId, "p1");
    assert.deepEqual(m.activeProblems, []);
    assert.equal(m.dictationBufferRef, null);
  });

  it("applies patch without changing identity keys", () => {
    const m = createEmptyEncounterMemory({
      consultationId: "c1",
      patientId: "p1",
    });
    const next = applyEncounterMemoryPatch(m, {
      encounterStatus: "in_progress",
      workflowPhase: "workspace_ready",
      activeProblems: ["HTA"],
      dictationBufferRef: { status: "listening", draftLength: 12, active: true },
    });
    assert.equal(next.consultationId, "c1");
    assert.equal(next.encounterStatus, "in_progress");
    assert.equal(next.workflowPhase, "workspace_ready");
    assert.deepEqual(next.activeProblems, ["HTA"]);
    assert.equal(next.dictationBufferRef?.draftLength, 12);
  });

  it("returns the same snapshot when the patch does not change content", () => {
    const m = createEmptyEncounterMemory({
      consultationId: "c1",
      patientId: "p1",
    });
    const first = applyEncounterMemoryPatch(m, {
      encounterStatus: "in_progress",
      activeProblems: ["HTA"],
    });
    const second = applyEncounterMemoryPatch(first, {
      encounterStatus: "in_progress",
      activeProblems: ["HTA"],
    });
    assert.equal(second, first);
    assert.equal(second.updatedAt, first.updatedAt);
  });
});
