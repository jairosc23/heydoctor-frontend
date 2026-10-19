/**
 * CP-27 — Basic Clinical Command handlers.
 * Produce effects only — no clinical logic, no backend, no Store.
 */

import type {
  ClinicalCommandHandler,
  ClinicalCommandHandlerOutput,
} from "./contracts";
import type { ClinicalCommand, ClinicalCommandType } from "./types";

function reject(reason: string): ClinicalCommandHandlerOutput {
  return { rejected: true, reason };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function createBootstrapSessionHandler(): ClinicalCommandHandler {
  return {
    type: "bootstrap_session",
    handle(command: ClinicalCommand) {
      if (command.type !== "bootstrap_session") {
        return reject("handler_type_mismatch");
      }
      const { consultationId, patientId, appointmentId } = command.payload;
      if (!isNonEmptyString(consultationId) || !isNonEmptyString(patientId)) {
        return reject("bootstrap_session_requires_consultation_and_patient");
      }
      return [
        {
          kind: "bootstrap_session",
          consultationId: consultationId.trim(),
          patientId: patientId.trim(),
          appointmentId: appointmentId ?? null,
        },
      ];
    },
  };
}

export function createRefreshWorkspaceHandler(): ClinicalCommandHandler {
  return {
    type: "refresh_workspace",
    handle(command: ClinicalCommand) {
      if (command.type !== "refresh_workspace") {
        return reject("handler_type_mismatch");
      }
      return [{ kind: "refresh_workspace" }];
    },
  };
}

export function createApproveActionHandler(): ClinicalCommandHandler {
  return {
    type: "approve_action",
    handle(command: ClinicalCommand) {
      if (command.type !== "approve_action") {
        return reject("handler_type_mismatch");
      }
      if (!isNonEmptyString(command.payload.actionId)) {
        return reject("approve_action_requires_action_id");
      }
      return [
        {
          kind: "approve_action",
          actionId: command.payload.actionId.trim(),
        },
      ];
    },
  };
}

export function createRejectActionHandler(): ClinicalCommandHandler {
  return {
    type: "reject_action",
    handle(command: ClinicalCommand) {
      if (command.type !== "reject_action") {
        return reject("handler_type_mismatch");
      }
      if (!isNonEmptyString(command.payload.actionId)) {
        return reject("reject_action_requires_action_id");
      }
      return [
        {
          kind: "reject_action",
          actionId: command.payload.actionId.trim(),
          reason: command.payload.reason,
        },
      ];
    },
  };
}

function createOpenPanelHandler(
  type: Extract<
    ClinicalCommandType,
    "open_workspace" | "open_timeline" | "open_memory" | "open_actions"
  >,
  panel: "workspace" | "timeline" | "memory" | "actions",
): ClinicalCommandHandler {
  return {
    type,
    handle(command: ClinicalCommand) {
      if (command.type !== type) {
        return reject("handler_type_mismatch");
      }
      return [{ kind: "open_panel", panel }];
    },
  };
}

export function createOpenWorkspaceHandler(): ClinicalCommandHandler {
  return createOpenPanelHandler("open_workspace", "workspace");
}

export function createOpenTimelineHandler(): ClinicalCommandHandler {
  return createOpenPanelHandler("open_timeline", "timeline");
}

export function createOpenMemoryHandler(): ClinicalCommandHandler {
  return createOpenPanelHandler("open_memory", "memory");
}

export function createOpenActionsHandler(): ClinicalCommandHandler {
  return createOpenPanelHandler("open_actions", "actions");
}

/** Default handler set for the eight foundation commands. */
export function createDefaultClinicalCommandHandlers(): ClinicalCommandHandler[] {
  return [
    createBootstrapSessionHandler(),
    createRefreshWorkspaceHandler(),
    createApproveActionHandler(),
    createRejectActionHandler(),
    createOpenWorkspaceHandler(),
    createOpenTimelineHandler(),
    createOpenMemoryHandler(),
    createOpenActionsHandler(),
  ];
}
