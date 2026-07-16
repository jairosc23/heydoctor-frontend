import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE, type GovernedClinicalReasoningDataset } from "./governed-clinical-reasoning-dataset";
import { mapGovernedClinicalReasoningDataset, mapGovernedClinicalReasoningDatasetEnvelope } from "./governed-clinical-reasoning-dataset-mapper";

describe("AI-55 GovernedClinicalReasoningDataset mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: GovernedClinicalReasoningDataset = {
      governedClinicalReasoningDatasetId: "id1",
      providerId: "openai",
      packageDatasetSlots: [],
      governance: { ...GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        governedReasoningWorkspaceId: "x",
        clinicalReasoningPackageId: "x",
        reviewSessionId: "x",
        assessmentPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapGovernedClinicalReasoningDatasetEnvelope({
      governedClinicalReasoningDataset: {
        source: "governed_clinical_reasoning_dataset",
        builderVersion: "1.0.0",
        governedClinicalReasoningDataset: model,
        governance: { ...GOVERNED_CLINICAL_REASONING_DATASET_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapGovernedClinicalReasoningDataset(null), null);
  });
});
