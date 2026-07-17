import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE, type PhysicianInterviewWorkspace } from "./physician-interview-workspace";
import { mapPhysicianInterviewWorkspace, mapPhysicianInterviewWorkspaceEnvelope } from "./physician-interview-workspace-mapper";

describe("AI-42 PhysicianInterviewWorkspace mapper", () => {
  it("maps envelope and preserves HITL", () => {
    const model: PhysicianInterviewWorkspace = {
      interviewWorkspaceId: "id1",
      providerId: "openai",
      interviewSlots: [],
      governance: { ...PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE },
      metadata: {
        sessionId: "x",
        consultationId: "x",
        patientId: "x",
        planId: "x",
        clinicalQuestionsId: "x",
        reviewSessionId: "x",
        generatedAt: "2026-07-12T00:00:00.000Z",
        builderVersion: "1.0.0",
        status: "empty",
        slotCount: 0,
        selectedProviderId: "openai",
      },
    };
    const mapped = mapPhysicianInterviewWorkspaceEnvelope({
      interviewWorkspace: {
        source: "physician_interview_workspace",
        builderVersion: "1.0.0",
        interviewWorkspace: model,
        governance: { ...PHYSICIAN_INTERVIEW_WORKSPACE_GOVERNANCE },
        reason: "empty",
        generatedAt: "2026-07-12T00:00:00.000Z",
      },
    });
    assert.ok(mapped);
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapPhysicianInterviewWorkspace(null), null);
  });
});
