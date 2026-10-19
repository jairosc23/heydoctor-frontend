import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { EVIDENCE_MAPPING_GOVERNANCE, type EvidenceMappingFoundation } from "./evidence-mapping-foundation";
import { mapEvidenceMappingFoundation, mapEvidenceMappingFoundationEnvelope } from "./evidence-mapping-foundation-mapper";

describe("AI-22 EvidenceMappingFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: EvidenceMappingFoundation = {
      evidenceMappingId: "id1",
      providerId: "openai",
      mappingSlots: [],
      governance: { ...EVIDENCE_MAPPING_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        differentialId: "x",
        findingRefId: "x",
        insightRefId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapEvidenceMappingFoundationEnvelope({
      evidenceMapping: {
        source: "evidence_mapping_foundation",
        builderVersion: "1.0.0",
        evidenceMapping: model,
        governance: { ...EVIDENCE_MAPPING_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapEvidenceMappingFoundation(null), null);
  });
});
