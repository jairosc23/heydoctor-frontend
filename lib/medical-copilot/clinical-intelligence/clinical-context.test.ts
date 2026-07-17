import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_CONTEXT_GOVERNANCE,
  type ClinicalContext,
} from "./clinical-context";
import {
  mapClinicalContext,
  mapClinicalContextEnvelope,
} from "./clinical-context-mapper";

describe("CI-9 Clinical Context mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const context: ClinicalContext = {
      caseRepresentationId: "case-rep-1",
      contextItems: [
        {
          id: "ctx-1",
          sectionId: "sec-1",
          layer: "findings",
          sourceItemId: "ri-f1",
          summary: "Finding one",
        },
      ],
      governance: { ...CLINICAL_CONTEXT_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        snapshotId: "snap-1",
        reviewId: "rev-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        engineVersion: "1.0.0",
        status: "partial",
        itemCount: 1,
      },
    };

    const mapped = mapClinicalContextEnvelope({
      context: {
        source: "clinical_context_engine",
        engineVersion: "1.0.0",
        context,
        governance: { ...CLINICAL_CONTEXT_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.context.caseRepresentationId, "case-rep-1");
    assert.equal(mapped.context.contextItems.length, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid context payloads", () => {
    assert.equal(mapClinicalContext(null), null);
    assert.equal(mapClinicalContext({ caseRepresentationId: "x" }), null);
  });
});
