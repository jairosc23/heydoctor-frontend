import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  selectArtifactCount,
  selectIsLoading,
  selectIsReady,
  selectPendingActions,
  selectSortedTimelineEntries,
} from "./selectors";
import {
  createMedicalCopilotStoreState,
  medicalCopilotReducer,
} from "./store";

describe("medicalCopilotReducer", () => {
  it("bootstraps loading then ready with shared state slices", () => {
    const started = medicalCopilotReducer(
      createMedicalCopilotStoreState(),
      {
        type: "BOOTSTRAP_START",
        payload: {
          consultationId: "c1",
          patientId: "p1",
        },
      },
    );
    assert.equal(started.loading, true);
    assert.equal(started.phase, "loading");
    assert.equal(started.consultationId, "c1");

    const ready = medicalCopilotReducer(started, {
      type: "BOOTSTRAP_SUCCESS",
      payload: {
        session: {
          sessionId: "s1",
          consultationId: "c1",
          patientId: "p1",
          status: "created",
        },
        workspace: {
          workspaceId: "w1",
          sessionId: "s1",
          artifacts: [
            {
              artifactId: "a1",
              artifactType: "prescription_draft",
              status: "draft",
              version: 1,
            },
          ],
        },
        timeline: {
          timelineId: "t1",
          sessionId: "s1",
          entries: [
            {
              timelineEntryId: "e2",
              timestamp: "2026-07-11T12:00:00.000Z",
              eventType: "artifact_published",
              summary: "later",
            },
            {
              timelineEntryId: "e1",
              timestamp: "2026-07-11T11:00:00.000Z",
              eventType: "session_created",
              summary: "earlier",
            },
          ],
        },
        memory: { memoryId: "m1", sessionId: "s1", entries: [] },
        actions: [
          {
            actionId: "act1",
            actionType: "review_prescription_draft",
            status: "created",
          },
          {
            actionId: "act2",
            actionType: "review_referral_draft",
            status: "approved",
          },
        ],
        syncedAt: "2026-07-11T12:30:00.000Z",
      },
    });

    assert.equal(ready.phase, "ready");
    assert.equal(ready.loading, false);
    assert.equal(selectIsReady(ready), true);
    assert.equal(selectArtifactCount(ready), 1);
    assert.deepEqual(
      selectSortedTimelineEntries(ready).map((e) => e.timelineEntryId),
      ["e1", "e2"],
    );
    assert.deepEqual(
      selectPendingActions(ready).map((a) => a.actionId),
      ["act1"],
    );
  });

  it("updates action status without touching other slices", () => {
    const base = createMedicalCopilotStoreState({
      phase: "ready",
      actions: [
        {
          actionId: "act1",
          actionType: "review_prescription_draft",
          status: "queued",
        },
      ],
      busyActionId: "act1",
      workspace: { workspaceId: "w1", sessionId: "s1" },
    });

    const updated = medicalCopilotReducer(base, {
      type: "ACTION_UPDATED",
      payload: {
        action: {
          actionId: "act1",
          actionType: "review_prescription_draft",
          status: "approved",
        },
      },
    });

    assert.equal(updated.actions[0]?.status, "approved");
    assert.equal(updated.busyActionId, null);
    assert.equal(updated.workspace?.workspaceId, "w1");
  });

  it("prepares dataSource switch for future SSE/WebSocket", () => {
    const next = medicalCopilotReducer(createMedicalCopilotStoreState(), {
      type: "SET_DATA_SOURCE",
      payload: { dataSource: "sse" },
    });
    assert.equal(next.dataSource, "sse");
    assert.equal(selectIsLoading(next), true);
  });

  it("handles bootstrap failure", () => {
    const failed = medicalCopilotReducer(
      createMedicalCopilotStoreState({ phase: "loading", loading: true }),
      {
        type: "BOOTSTRAP_FAILURE",
        payload: { error: "network" },
      },
    );
    assert.equal(failed.phase, "error");
    assert.equal(failed.error, "network");
    assert.equal(failed.loading, false);
  });
});
