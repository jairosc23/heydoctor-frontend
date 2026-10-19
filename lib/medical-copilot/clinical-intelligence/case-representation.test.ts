import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_CASE_REPRESENTATION_GOVERNANCE,
  type ClinicalCaseRepresentation,
} from "./case-representation";
import {
  mapCaseRepresentation,
  mapCaseRepresentationEnvelope,
} from "./case-representation-mapper";

describe("CI-8 Clinical Case Representation mapper", () => {
  it("maps engine envelope and preserves HITL governance", () => {
    const representation: ClinicalCaseRepresentation = {
      reviewId: "rev-1",
      sections: [
        {
          id: "sec-1",
          layer: "findings",
          title: "Findings",
          itemIds: ["ri-f1"],
          summaries: ["Finding one"],
        },
      ],
      governance: { ...CLINICAL_CASE_REPRESENTATION_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        snapshotId: "snap-1",
        generatedAt: "2026-07-12T00:00:00.000Z",
        engineVersion: "1.0.0",
        status: "partial",
        sectionCount: 1,
        itemCount: 1,
      },
    };

    const mapped = mapCaseRepresentationEnvelope({
      representation: {
        source: "clinical_case_representation_engine",
        engineVersion: "1.0.0",
        representation,
        governance: { ...CLINICAL_CASE_REPRESENTATION_GOVERNANCE },
        reason: null,
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.representation.reviewId, "rev-1");
    assert.equal(mapped.representation.sections.length, 1);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
  });

  it("rejects invalid representation payloads", () => {
    assert.equal(mapCaseRepresentation(null), null);
    assert.equal(mapCaseRepresentation({ reviewId: "x" }), null);
  });
});
