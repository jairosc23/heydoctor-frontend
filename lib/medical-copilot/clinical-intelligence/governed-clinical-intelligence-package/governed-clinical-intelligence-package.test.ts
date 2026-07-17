import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mapGovernedClinicalIntelligencePackageEnvelope } from "./governed-clinical-intelligence-package-mapper";

describe("GovernedClinicalIntelligencePackage mapper (AI-85)", () => {
  it("maps builder result without write flags", () => {
    const mapped = mapGovernedClinicalIntelligencePackageEnvelope({
      source: "governed_clinical_intelligence_package",
      builderVersion: "1.0.0",
      governedClinicalIntelligencePackage: {
        governedClinicalIntelligencePackageId: "gcip-1",
        providerId: "openai",
        intelligencePackageSlots: [],
        governance: { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false },
        metadata: {
          sessionId: "s", consultationId: "c", patientId: "p", planId: "pl",
          physicianReasoningReviewId: "prr", governedReasoningOutputId: "gro",
          clinicalReasoningPackageId: "crp", assessmentPackageId: "ap", reviewSessionId: "rs",
          generatedAt: new Date().toISOString(), builderVersion: "1.0.0", status: "empty", slotCount: 0, selectedProviderId: "openai",
        },
      },
      governance: { requiresPhysicianReview: true, executesAction: false, autoPersistedToEmr: false },
      reason: "empty",
      generatedAt: new Date().toISOString(),
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governedClinicalIntelligencePackage.metadata.status, "empty");
  });
});
