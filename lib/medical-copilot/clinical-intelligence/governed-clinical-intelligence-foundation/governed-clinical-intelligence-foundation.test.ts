import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE, type GovernedClinicalIntelligenceFoundation } from "./governed-clinical-intelligence-foundation";
import { mapGovernedClinicalIntelligenceFoundation, mapGovernedClinicalIntelligenceFoundationEnvelope } from "./governed-clinical-intelligence-foundation-mapper";
describe("AI-95 GovernedClinicalIntelligenceFoundation mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalIntelligenceFoundation = {
      governedClinicalIntelligenceFoundationId: "id1", providerId: "openai", foundationSlots: [], governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE },
      metadata: { sessionId: "x", consultationId: "x", patientId: "x", planId: "x",
        clinicalIntelligenceOutputId: "x",
        governedClinicalIntelligencePackageId: "x",
        clinicalReasoningPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z", builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai" },
    };
    const mapped = mapGovernedClinicalIntelligenceFoundationEnvelope({ governedClinicalIntelligenceFoundation: { source: "governed_clinical_intelligence_foundation", builderVersion: "1.0.0", governedClinicalIntelligenceFoundation: model, governance: { ...GOVERNED_CLINICAL_INTELLIGENCE_FOUNDATION_GOVERNANCE }, reason: "empty", generatedAt: "2026-07-13T00:00:00.000Z" } });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalIntelligenceFoundation(null), null);
  });
});
