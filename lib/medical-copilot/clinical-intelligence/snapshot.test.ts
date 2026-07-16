import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE,
  type ClinicalCopilotSnapshot,
} from "./snapshot";
import { mapSnapshot, mapSnapshotEnvelope } from "./snapshot-mapper";

describe("CI-6 Clinical Copilot Snapshot mapper", () => {
  it("maps orchestrator envelope and preserves HITL governance", () => {
    const snapshot: ClinicalCopilotSnapshot = {
      findings: [{ id: "f1", category: "workspace", summary: "Finding" }],
      insights: [{ id: "i1", category: "workspace", summary: "Insight" }],
      recommendations: [
        { id: "r1", category: "workspace", summary: "Recommendation" },
      ],
      decisions: [{ id: "d1", category: "workspace", summary: "Decision" }],
      reasoning: [{ id: "rr1", category: "workspace", summary: "Reasoning" }],
      governance: { ...CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        orchestratorVersion: "1.0.0",
        status: "ok",
        counts: {
          findings: 1,
          insights: 1,
          recommendations: 1,
          decisions: 1,
          reasoning: 1,
        },
      },
    };

    const mapped = mapSnapshotEnvelope({
      snapshot: {
        source: "clinical_copilot_snapshot_orchestrator",
        orchestratorVersion: "1.0.0",
        snapshot,
        governance: { ...CLINICAL_COPILOT_SNAPSHOT_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.snapshot.metadata.status, "ok");
    assert.equal(mapped.snapshot.findings.length, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid snapshot payloads", () => {
    assert.equal(mapSnapshot(null), null);
    assert.equal(mapSnapshot({ findings: [] }), null);
  });
});
