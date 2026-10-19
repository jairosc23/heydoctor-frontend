import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createMedicalCopilotStoreState,
  medicalCopilotReducer,
} from "../store";
import type {
  MedicalCopilotState,
  MedicalCopilotStoreAction,
} from "../store-types";
import {
  createMedicalCopilotRealtimeAdapter,
  createRealtimeEventDispatcher,
  createRestActionUpdatedEvent,
  createRestConnectionStateEvent,
  createRestSessionUpdatedEvent,
  createRestWorkspaceUpdatedEvent,
  createSseTransportAdapter,
  createWebSocketTransportAdapter,
  defaultRealtimeEventMapper,
  mapRealtimeEventToStoreActions,
  restRefreshToRealtimeEvents,
} from "./index";

function readyState(): MedicalCopilotState {
  return createMedicalCopilotStoreState({
    phase: "ready",
    loading: false,
    dataSource: "rest",
    session: {
      sessionId: "s1",
      consultationId: "c1",
      patientId: "p1",
      status: "active",
    },
    workspace: {
      workspaceId: "w1",
      sessionId: "s1",
      artifacts: [],
    },
    timeline: {
      timelineId: "t1",
      sessionId: "s1",
      entries: [],
    },
    memory: {
      memoryId: "m1",
      sessionId: "s1",
      entries: [],
    },
    actions: [
      {
        actionId: "act-1",
        actionType: "approve_draft",
        status: "pending_approval",
      },
    ],
  });
}

describe("mapRealtimeEventToStoreActions", () => {
  it("maps workspace_updated to REFRESH_SUCCESS merging current slices", () => {
    const state = readyState();
    const actions = mapRealtimeEventToStoreActions(
      createRestWorkspaceUpdatedEvent({
        workspaceId: "w2",
        sessionId: "s1",
        artifacts: [
          {
            artifactId: "a1",
            artifactType: "prescription_draft",
            status: "draft",
            version: 1,
          },
        ],
      }),
      () => state,
    );

    assert.equal(actions.length, 1);
    assert.equal(actions[0]?.type, "REFRESH_SUCCESS");
    if (actions[0]?.type === "REFRESH_SUCCESS") {
      assert.equal(actions[0].payload.workspace?.workspaceId, "w2");
      assert.equal(actions[0].payload.timeline?.timelineId, "t1");
      assert.equal(actions[0].payload.memory?.memoryId, "m1");
      assert.equal(actions[0].payload.actions.length, 1);
    }
  });

  it("maps action_updated to ACTION_UPDATED", () => {
    const actions = mapRealtimeEventToStoreActions(
      createRestActionUpdatedEvent({
        actionId: "act-1",
        actionType: "approve_draft",
        status: "approved",
      }),
      () => readyState(),
    );
    assert.deepEqual(actions, [
      {
        type: "ACTION_UPDATED",
        payload: {
          action: {
            actionId: "act-1",
            actionType: "approve_draft",
            status: "approved",
          },
        },
      },
    ]);
  });

  it("maps session_updated to BOOTSTRAP_SUCCESS preserving panels", () => {
    const state = readyState();
    const actions = defaultRealtimeEventMapper.map(
      createRestSessionUpdatedEvent({
        sessionId: "s1",
        consultationId: "c1",
        patientId: "p1",
        status: "completed",
      }),
      () => state,
    );
    assert.equal(actions[0]?.type, "BOOTSTRAP_SUCCESS");
    if (actions[0]?.type === "BOOTSTRAP_SUCCESS") {
      assert.equal(actions[0].payload.session.status, "completed");
      assert.equal(actions[0].payload.workspace?.workspaceId, "w1");
    }
  });

  it("maps connection_state to SET_DATA_SOURCE only when source changes", () => {
    const same = mapRealtimeEventToStoreActions(
      createRestConnectionStateEvent("connected"),
      () => readyState(),
    );
    assert.deepEqual(same, []);

    const changed = mapRealtimeEventToStoreActions(
      {
        type: "connection_state",
        source: "sse",
        occurredAt: "2026-07-11T00:00:00.000Z",
        payload: { status: "connected", dataSource: "sse" },
      },
      () => readyState(),
    );
    assert.deepEqual(changed, [
      { type: "SET_DATA_SOURCE", payload: { dataSource: "sse" } },
    ]);
  });
});

describe("RealtimeEventDispatcher", () => {
  it("dispatches mapped actions when attached", () => {
    let state = readyState();
    const dispatched: MedicalCopilotStoreAction[] = [];
    const dispatcher = createRealtimeEventDispatcher();

    dispatcher.attach((action) => {
      dispatched.push(action);
      state = medicalCopilotReducer(state, action);
    }, () => state);

    const result = dispatcher.dispatchEvent(
      createRestWorkspaceUpdatedEvent({
        workspaceId: "w-new",
        sessionId: "s1",
      }),
    );

    assert.equal(result.length, 1);
    assert.equal(dispatched.length, 1);
    assert.equal(state.workspace?.workspaceId, "w-new");
    assert.equal(state.timeline?.timelineId, "t1");
  });

  it("returns empty actions when detached", () => {
    const dispatcher = createRealtimeEventDispatcher();
    const result = dispatcher.dispatchEvent(
      createRestActionUpdatedEvent({
        actionId: "x",
        actionType: "noop",
        status: "pending",
      }),
    );
    assert.deepEqual(result, []);
  });
});

describe("MedicalCopilotRealtimeAdapter", () => {
  it("ingests REST events into the same reducer path", () => {
    let state = readyState();
    const adapter = createMedicalCopilotRealtimeAdapter();

    adapter.attach((action) => {
      state = medicalCopilotReducer(state, action);
    }, () => state);

    adapter.ingest(
      createRestActionUpdatedEvent({
        actionId: "act-1",
        actionType: "approve_draft",
        status: "rejected",
      }),
    );

    assert.equal(state.actions[0]?.status, "rejected");
  });

  it("tracks connection_state without requiring UI", () => {
    let state = readyState();
    const adapter = createMedicalCopilotRealtimeAdapter();
    adapter.attach((action) => {
      state = medicalCopilotReducer(state, action);
    }, () => state);

    adapter.ingest(createRestConnectionStateEvent("connected", "rest_ready"));
    assert.equal(adapter.connectionState.status, "connected");
    assert.equal(adapter.connectionState.reason, "rest_ready");
    assert.equal(state.dataSource, "rest");

    adapter.setDataSource("websocket");
    assert.equal(state.dataSource, "websocket");
    assert.equal(adapter.connectionState.dataSource, "websocket");
  });

  it("keeps SSE and WebSocket transports inactive", () => {
    const adapter = createMedicalCopilotRealtimeAdapter();
    assert.equal(adapter.getTransport("rest").active, true);
    assert.equal(adapter.getTransport("sse").active, false);
    assert.equal(adapter.getTransport("websocket").active, false);

    const sse = createSseTransportAdapter();
    const ws = createWebSocketTransportAdapter();
    sse.start();
    ws.start();
    assert.equal(sse.active, false);
    assert.equal(ws.active, false);
  });

  it("expands REST refresh payloads into ordered realtime events", () => {
    const events = restRefreshToRealtimeEvents({
      workspace: { workspaceId: "w1", sessionId: "s1" },
      timeline: { timelineId: "t1", sessionId: "s1" },
      memory: { memoryId: "m1", sessionId: "s1" },
      actions: [
        {
          actionId: "a1",
          actionType: "approve_draft",
          status: "pending_approval",
        },
      ],
      syncedAt: "2026-07-11T12:00:00.000Z",
    });

    assert.deepEqual(
      events.map((e) => e.type),
      ["workspace_updated", "timeline_updated", "memory_updated"],
    );
    assert.ok(events.every((e) => e.source === "rest"));
    const memoryEvent = events[2];
    assert.equal(memoryEvent?.type, "memory_updated");
    if (memoryEvent?.type === "memory_updated") {
      assert.equal(memoryEvent.payload.actions?.length, 1);
    }
  });

  it("ingestRestRefresh replaces panels and actions via Store actions", () => {
    let state = readyState();
    const adapter = createMedicalCopilotRealtimeAdapter();
    adapter.attach((action) => {
      state = medicalCopilotReducer(state, action);
    }, () => state);

    adapter.ingestRestRefresh({
      workspace: { workspaceId: "w9", sessionId: "s1" },
      timeline: { timelineId: "t9", sessionId: "s1" },
      memory: { memoryId: "m9", sessionId: "s1" },
      actions: [
        {
          actionId: "new-1",
          actionType: "review_note",
          status: "pending_approval",
        },
      ],
      syncedAt: "2026-07-11T12:00:00.000Z",
    });

    assert.equal(state.workspace?.workspaceId, "w9");
    assert.equal(state.timeline?.timelineId, "t9");
    assert.equal(state.memory?.memoryId, "m9");
    assert.equal(state.actions.length, 1);
    assert.equal(state.actions[0]?.actionId, "new-1");
    assert.equal(adapter.connectionState.status, "connected");
  });

  it("does not ingest when detached", () => {
    const adapter = createMedicalCopilotRealtimeAdapter();
    const result = adapter.ingest(
      createRestWorkspaceUpdatedEvent({
        workspaceId: "w",
        sessionId: "s",
      }),
    );
    assert.deepEqual(result, []);
  });
});
