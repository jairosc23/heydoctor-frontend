import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { CLINICAL_REASONING_DATASET_GOVERNANCE, type ClinicalReasoningDataset } from "./clinical-reasoning-dataset";
import { mapClinicalReasoningDataset, mapClinicalReasoningDatasetEnvelope } from "./clinical-reasoning-dataset-mapper";

describe("AI-51 ClinicalReasoningDataset mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: ClinicalReasoningDataset = {
      clinicalReasoningDatasetId: "id1",
      providerId: "openai",
      datasetSlots: [],
      governance: { ...CLINICAL_REASONING_DATASET_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        clinicalReasoningPackageId: "x",
        generatedAt: "2026-07-13T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapClinicalReasoningDatasetEnvelope({
      clinicalReasoningDataset: {
        source: "clinical_reasoning_dataset",
        builderVersion: "1.0.0",
        clinicalReasoningDataset: model,
        governance: { ...CLINICAL_REASONING_DATASET_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-13T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapClinicalReasoningDataset(null), null);
  });
});
