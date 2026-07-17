import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_AI_OUTPUT_GOVERNANCE,
  type GovernedClinicalAIOutput,
} from "./governed-clinical-ai-output";
import {
  mapGovernedClinicalAIOutput,
  mapGovernedClinicalAIOutputEnvelope,
} from "./governed-clinical-ai-output-mapper";

describe("AI-13 GovernedClinicalAIOutput mapper", () => {
  it("maps envelope and preserves HITL governance", () => {
    const model: GovernedClinicalAIOutput = {
      outputId: "id_empty",
      providerId: "noop",
      outputItems: [],
      governance: { ...CLINICAL_AI_OUTPUT_GOVERNANCE },
      metadata: {
        sessionId: "s1",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        executionId: "x",
        responseId: "x",
        promptId: "x",
        templateId: "x",
        composedPromptId: "x",
        payloadId: "x",
        invocationId: "x",
        normalizedId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "noop",
      },
    };

    const mapped = mapGovernedClinicalAIOutputEnvelope({
      output: {
        source: "governed_clinical_ai_output",
        builderVersion: "1.0.0",
        output: model,
        governance: { ...CLINICAL_AI_OUTPUT_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });

    assert.ok(mapped);
    assert.equal(mapped.output.providerId, "noop");
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(
      Object.keys(mapped.output).sort().join(","),
      ["outputId", "governance", "metadata", "providerId", "outputItems"].sort().join(","),
    );
  });

  it("rejects invalid payloads", () => {
    assert.equal(mapGovernedClinicalAIOutput(null), null);
    assert.equal(mapGovernedClinicalAIOutput({ providerId: "openai" }), null);
  });
});
