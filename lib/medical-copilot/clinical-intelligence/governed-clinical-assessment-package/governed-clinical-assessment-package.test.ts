import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE, type GovernedClinicalAssessmentPackage } from "./governed-clinical-assessment-package";
import { mapGovernedClinicalAssessmentPackage, mapGovernedClinicalAssessmentPackageEnvelope } from "./governed-clinical-assessment-package-mapper";

describe("AI-45 GovernedClinicalAssessmentPackage mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalAssessmentPackage = {
      assessmentPackageId: "id1",
      providerId: "openai",
      packageSlots: [],
      governance: { ...GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        reviewSessionId: "x",
        interviewWorkspaceId: "x",
        clinicalQuestionsId: "x",
        completenessId: "x",
        readinessWorkspaceId: "x",
        confidenceId: "x",
        clinicalPlanId: "x",
        contextId: "x",
        evidenceMappingId: "x",
        reviewId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedClinicalAssessmentPackageEnvelope({
      assessmentPackage: {
        source: "governed_clinical_assessment_package",
        builderVersion: "1.0.0",
        assessmentPackage: model,
        governance: { ...GOVERNED_CLINICAL_ASSESSMENT_PACKAGE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalAssessmentPackage(null), null);
  });
});
