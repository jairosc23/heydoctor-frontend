import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  actionableActions,
  EMPTY_ACTIONS,
  assertMedicalCopilotGovernance,
  envelopeIsOk,
  formatEventLabel,
  sortTimelineEntries,
} from "./view-model";
import type { MedicalCopilotApiEnvelope } from "./types";

describe("medical-copilot view-model", () => {
  it("validates HITL governance flags", () => {
    assert.equal(
      assertMedicalCopilotGovernance({
        requiresPhysicianReview: true,
        executesAction: false,
        autoPersistedToEmr: false,
      }),
      true,
    );
    assert.equal(
      assertMedicalCopilotGovernance({
        requiresPhysicianReview: true,
        executesAction: true as false,
        autoPersistedToEmr: false,
      }),
      false,
    );
  });

  it("sorts timeline entries chronologically", () => {
    const sorted = sortTimelineEntries([
      {
        timelineEntryId: "2",
        timestamp: "2026-07-11T12:00:00.000Z",
        eventType: "artifact_published",
        summary: "later",
      },
      {
        timelineEntryId: "1",
        timestamp: "2026-07-11T11:00:00.000Z",
        eventType: "session_created",
        summary: "earlier",
      },
    ]);
    assert.equal(sorted[0]?.timelineEntryId, "1");
    assert.equal(sorted[1]?.timelineEntryId, "2");
  });

  it("filters actionable actions and formats labels", () => {
    assert.deepEqual(
      actionableActions([
        { actionId: "a", actionType: "review_prescription_draft", status: "created" },
        { actionId: "b", actionType: "review_referral_draft", status: "approved" },
        { actionId: "c", actionType: "review_skill_outcome", status: "queued" },
      ]).map((a) => a.actionId),
      ["a", "c"],
    );
    assert.equal(formatEventLabel("session_created"), "Session Created");
  });

  it("returns a stable empty list when no actions are pending", () => {
    const empty = actionableActions([]);
    assert.equal(empty, EMPTY_ACTIONS);
    assert.equal(empty, actionableActions(undefined));
    assert.equal(empty, actionableActions(null));
    assert.equal(
      empty,
      actionableActions([
        {
          actionId: "b",
          actionType: "review_referral_draft",
          status: "approved",
        },
      ]),
    );
  });

  it("accepts ok envelopes with governance", () => {
    const envelope: MedicalCopilotApiEnvelope<{ ok: true }> = {
      source: "medical_copilot_facade",
      apiVersion: "v1",
      status: "ok",
      data: { ok: true },
      governance: {
        requiresPhysicianReview: true,
        executesAction: false,
        autoPersistedToEmr: false,
      },
      reason: null,
      generatedAt: new Date().toISOString(),
    };
    assert.equal(envelopeIsOk(envelope), true);
  });
});
