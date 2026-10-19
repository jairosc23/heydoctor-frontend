import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CLINICAL_COMMAND_TYPES,
  createApproveActionCommand,
  createBootstrapSessionCommand,
  createClinicalCommandBus,
  createClinicalCommandDispatcher,
  createDefaultClinicalCommandHandlers,
  createOpenTimelineCommand,
  createRefreshWorkspaceCommand,
  createRejectActionCommand,
  type ClinicalCommandPorts,
  type ClinicalPanelId,
} from "./index";

describe("ClinicalCommandDispatcher", () => {
  it("resolves registered commands into effects without executing ports", () => {
    const dispatcher = createClinicalCommandDispatcher();
    for (const handler of createDefaultClinicalCommandHandlers()) {
      dispatcher.register(handler);
    }

    const result = dispatcher.resolve(
      createApproveActionCommand("act-1", "shortcut"),
    );

    assert.equal(result.status, "handled");
    assert.equal(result.source, "shortcut");
    assert.equal(result.executed, false);
    assert.deepEqual(result.effects, [
      { kind: "approve_action", actionId: "act-1" },
    ]);
  });

  it("returns unhandled when no handler is registered", () => {
    const dispatcher = createClinicalCommandDispatcher();
    const result = dispatcher.resolve(createRefreshWorkspaceCommand("ui"));
    assert.equal(result.status, "unhandled");
    assert.equal(result.effects.length, 0);
  });

  it("rejects invalid approve_action payloads", () => {
    const dispatcher = createClinicalCommandDispatcher();
    dispatcher.register(
      createDefaultClinicalCommandHandlers().find(
        (h) => h.type === "approve_action",
      )!,
    );

    const result = dispatcher.resolve(createApproveActionCommand("  ", "ui"));
    assert.equal(result.status, "rejected");
    assert.equal(result.reason, "approve_action_requires_action_id");
  });
});

describe("ClinicalCommandBus", () => {
  it("registers the eight foundation command types by default", () => {
    const bus = createClinicalCommandBus();
    for (const type of CLINICAL_COMMAND_TYPES) {
      assert.equal(bus.dispatcher.hasHandler(type), true);
    }
  });

  it("dispatches without ports and keeps source off effect payloads", async () => {
    const bus = createClinicalCommandBus();
    const result = await bus.dispatch(
      createBootstrapSessionCommand(
        { consultationId: "c1", patientId: "p1" },
        "voice",
      ),
    );

    assert.equal(result.status, "handled");
    assert.equal(result.source, "voice");
    assert.equal(result.executed, false);
    assert.equal(result.reason, "ports_not_attached");
    assert.deepEqual(result.effects, [
      {
        kind: "bootstrap_session",
        consultationId: "c1",
        patientId: "p1",
        appointmentId: null,
      },
    ]);
    assert.equal("source" in (result.effects[0] as object), false);
  });

  it("executes ports without forwarding command source", async () => {
    const calls: string[] = [];
    const panels: ClinicalPanelId[] = [];

    const ports: ClinicalCommandPorts = {
      refreshWorkspace: () => {
        calls.push("refresh");
      },
      approveAction: (actionId) => {
        calls.push(`approve:${actionId}`);
      },
      rejectAction: (actionId, reason) => {
        calls.push(`reject:${actionId}:${reason ?? ""}`);
      },
      openPanel: (panel) => {
        panels.push(panel);
      },
      bootstrapSession: (input) => {
        calls.push(`bootstrap:${input.consultationId}:${input.patientId}`);
      },
    };

    const bus = createClinicalCommandBus({ ports });

    await bus.dispatch(createRefreshWorkspaceCommand("keyboard"));
    await bus.dispatch(createApproveActionCommand("a1", "mouse"));
    await bus.dispatch(
      createRejectActionCommand("a2", "not clinically indicated", "ui"),
    );
    await bus.dispatch(createOpenTimelineCommand("shortcut"));
    await bus.dispatch(
      createBootstrapSessionCommand(
        { consultationId: "c9", patientId: "p9", appointmentId: "ap1" },
        "automation",
      ),
    );

    assert.deepEqual(calls, [
      "refresh",
      "approve:a1",
      "reject:a2:not clinically indicated",
      "bootstrap:c9:p9",
    ]);
    assert.deepEqual(panels, ["timeline"]);
  });

  it("detachPorts stops execution while resolve still works", async () => {
    let refreshCount = 0;
    const bus = createClinicalCommandBus({
      ports: {
        refreshWorkspace: () => {
          refreshCount += 1;
        },
      },
    });

    const executed = await bus.dispatch(createRefreshWorkspaceCommand());
    assert.equal(executed.executed, true);
    assert.equal(refreshCount, 1);

    bus.detachPorts();
    const idle = await bus.dispatch(createRefreshWorkspaceCommand());
    assert.equal(idle.executed, false);
    assert.equal(idle.reason, "ports_not_attached");
    assert.equal(refreshCount, 1);

    const resolved = bus.resolve(createOpenTimelineCommand("system"));
    assert.equal(resolved.status, "handled");
    assert.deepEqual(resolved.effects, [
      { kind: "open_panel", panel: "timeline" },
    ]);
  });

  it("supports multiple producers emitting the same command type", async () => {
    const actionIds: string[] = [];
    const bus = createClinicalCommandBus({
      ports: {
        approveAction: (actionId) => {
          actionIds.push(actionId);
        },
      },
    });

    await bus.dispatch(createApproveActionCommand("x", "ui"));
    await bus.dispatch(createApproveActionCommand("x", "voice"));
    await bus.dispatch(createApproveActionCommand("x", "shortcut"));

    assert.deepEqual(actionIds, ["x", "x", "x"]);
  });
});
