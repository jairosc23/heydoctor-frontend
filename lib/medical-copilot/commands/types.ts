/**
 * CP-27 — Clinical Command Bus Foundation types.
 * Interaction intents are transport/UI-agnostic; the Store never sees the source.
 */

export type ClinicalCommandType =
  | "bootstrap_session"
  | "refresh_workspace"
  | "approve_action"
  | "reject_action"
  | "open_workspace"
  | "open_timeline"
  | "open_memory"
  | "open_actions";

/** Producer of the interaction — never forwarded into the Store. */
export type ClinicalCommandSource =
  | "ui"
  | "keyboard"
  | "mouse"
  | "shortcut"
  | "voice"
  | "automation"
  | "system";

export type ClinicalPanelId =
  | "workspace"
  | "timeline"
  | "memory"
  | "actions";

export type ClinicalCommandBase = {
  commandId: string;
  source: ClinicalCommandSource;
  issuedAt: string;
  /** Optional correlation / idempotency key across producers. */
  correlationId?: string;
};

export type BootstrapSessionCommand = ClinicalCommandBase & {
  type: "bootstrap_session";
  payload: {
    consultationId: string;
    patientId: string;
    appointmentId?: string | null;
  };
};

export type RefreshWorkspaceCommand = ClinicalCommandBase & {
  type: "refresh_workspace";
  payload?: Record<string, never>;
};

export type ApproveActionCommand = ClinicalCommandBase & {
  type: "approve_action";
  payload: { actionId: string };
};

export type RejectActionCommand = ClinicalCommandBase & {
  type: "reject_action";
  payload: { actionId: string; reason?: string };
};

export type OpenWorkspaceCommand = ClinicalCommandBase & {
  type: "open_workspace";
  payload?: Record<string, never>;
};

export type OpenTimelineCommand = ClinicalCommandBase & {
  type: "open_timeline";
  payload?: Record<string, never>;
};

export type OpenMemoryCommand = ClinicalCommandBase & {
  type: "open_memory";
  payload?: Record<string, never>;
};

export type OpenActionsCommand = ClinicalCommandBase & {
  type: "open_actions";
  payload?: Record<string, never>;
};

export type ClinicalCommand =
  | BootstrapSessionCommand
  | RefreshWorkspaceCommand
  | ApproveActionCommand
  | RejectActionCommand
  | OpenWorkspaceCommand
  | OpenTimelineCommand
  | OpenMemoryCommand
  | OpenActionsCommand;

/**
 * Side-effect intent produced by handlers.
 * Applied only via injected ports — never imports Store/API.
 */
export type ClinicalCommandEffect =
  | {
      kind: "bootstrap_session";
      consultationId: string;
      patientId: string;
      appointmentId?: string | null;
    }
  | { kind: "refresh_workspace" }
  | { kind: "approve_action"; actionId: string }
  | { kind: "reject_action"; actionId: string; reason?: string }
  | { kind: "open_panel"; panel: ClinicalPanelId };

export type ClinicalCommandResultStatus =
  | "handled"
  | "rejected"
  | "unhandled";

export type ClinicalCommandResult = {
  commandId: string;
  type: ClinicalCommandType;
  source: ClinicalCommandSource;
  status: ClinicalCommandResultStatus;
  effects: ClinicalCommandEffect[];
  /** True when ports executed at least one effect. */
  executed: boolean;
  reason: string | null;
};

export const CLINICAL_COMMAND_TYPES: readonly ClinicalCommandType[] = [
  "bootstrap_session",
  "refresh_workspace",
  "approve_action",
  "reject_action",
  "open_workspace",
  "open_timeline",
  "open_memory",
  "open_actions",
] as const;
