import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE, type GovernedClinicalSessionPackage } from "./governed-clinical-session-package";
import { mapGovernedClinicalSessionPackage, mapGovernedClinicalSessionPackageEnvelope } from "./governed-clinical-session-package-mapper";

describe("AI-30 GovernedClinicalSessionPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalSessionPackage = {
      sessionPackageId: "id1",
      providerId: "openai",
      packageSlots: [],
      governance: { ...GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        contextId: "x",
        clinicalPlanId: "x",
        findingRefId: "x",
        insightRefId: "x",
        recommendationRefId: "x",
        reviewId: "x",
        caseId: "x",
        responseId: "x",
        differentialId: "x",
        evidenceMappingId: "x",
        confidenceId: "x",
        missingInformationId: "x",
        priorityWorkspaceId: "x",
        workspaceId: "x",
        evidenceWorkspaceId: "x",
        gapAnalyzerId: "x",
        reviewWorkspaceV2Id: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedClinicalSessionPackageEnvelope({
      sessionPackage: {
        source: "governed_clinical_session_package",
        builderVersion: "1.0.0",
        sessionPackage: model,
        governance: { ...GOVERNED_CLINICAL_SESSION_PACKAGE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalSessionPackage(null), null);
  });
});
