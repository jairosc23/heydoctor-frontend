/**
 * CP-27 — Factory helpers for ClinicalCommand producers.
 */

import type {
  ApproveActionCommand,
  BootstrapSessionCommand,
  ClinicalCommandSource,
  OpenActionsCommand,
  OpenMemoryCommand,
  OpenTimelineCommand,
  OpenWorkspaceCommand,
  RefreshWorkspaceCommand,
  RejectActionCommand,
} from "./types";

function createCommandId(): string {
  return `cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function base(
  source: ClinicalCommandSource,
  correlationId?: string,
): {
  commandId: string;
  source: ClinicalCommandSource;
  issuedAt: string;
  correlationId?: string;
} {
  return {
    commandId: createCommandId(),
    source,
    issuedAt: new Date().toISOString(),
    ...(correlationId ? { correlationId } : {}),
  };
}

export function createBootstrapSessionCommand(
  payload: BootstrapSessionCommand["payload"],
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): BootstrapSessionCommand {
  return {
    ...base(source, correlationId),
    type: "bootstrap_session",
    payload,
  };
}

export function createRefreshWorkspaceCommand(
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): RefreshWorkspaceCommand {
  return {
    ...base(source, correlationId),
    type: "refresh_workspace",
    payload: {},
  };
}

export function createApproveActionCommand(
  actionId: string,
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): ApproveActionCommand {
  return {
    ...base(source, correlationId),
    type: "approve_action",
    payload: { actionId },
  };
}

export function createRejectActionCommand(
  actionId: string,
  reason?: string,
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): RejectActionCommand {
  return {
    ...base(source, correlationId),
    type: "reject_action",
    payload: { actionId, ...(reason !== undefined ? { reason } : {}) },
  };
}

export function createOpenWorkspaceCommand(
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): OpenWorkspaceCommand {
  return {
    ...base(source, correlationId),
    type: "open_workspace",
    payload: {},
  };
}

export function createOpenTimelineCommand(
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): OpenTimelineCommand {
  return {
    ...base(source, correlationId),
    type: "open_timeline",
    payload: {},
  };
}

export function createOpenMemoryCommand(
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): OpenMemoryCommand {
  return {
    ...base(source, correlationId),
    type: "open_memory",
    payload: {},
  };
}

export function createOpenActionsCommand(
  source: ClinicalCommandSource = "ui",
  correlationId?: string,
): OpenActionsCommand {
  return {
    ...base(source, correlationId),
    type: "open_actions",
    payload: {},
  };
}
