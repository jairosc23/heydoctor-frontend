/**
 * CP-27 — Public contracts for the Clinical Command Bus.
 * Handlers never call backend or Store; ports are the only integration seam.
 */

import type {
  ClinicalCommand,
  ClinicalCommandEffect,
  ClinicalCommandResult,
  ClinicalCommandType,
  ClinicalPanelId,
} from "./types";

/** Host-injected ports — wired later to Store/Provider/UI navigation. */
export type ClinicalCommandPorts = {
  bootstrapSession?: (input: {
    consultationId: string;
    patientId: string;
    appointmentId?: string | null;
  }) => void | Promise<void>;
  refreshWorkspace?: () => void | Promise<void>;
  approveAction?: (actionId: string) => void | Promise<void>;
  rejectAction?: (actionId: string, reason?: string) => void | Promise<void>;
  openPanel?: (panel: ClinicalPanelId) => void | Promise<void>;
};

export type ClinicalCommandHandlerReject = {
  rejected: true;
  reason: string;
};

export type ClinicalCommandHandlerOutput =
  | ClinicalCommandEffect[]
  | ClinicalCommandHandlerReject;

export interface ClinicalCommandHandler {
  readonly type: ClinicalCommandType;
  handle(command: ClinicalCommand): ClinicalCommandHandlerOutput;
}

export interface ClinicalCommandDispatcher {
  register(handler: ClinicalCommandHandler): void;
  unregister(type: ClinicalCommandType): void;
  hasHandler(type: ClinicalCommandType): boolean;
  /** Resolve effects only — does not execute ports. */
  resolve(command: ClinicalCommand): ClinicalCommandResult;
}

export interface ClinicalCommandBus {
  readonly dispatcher: ClinicalCommandDispatcher;
  attachPorts(ports: ClinicalCommandPorts): void;
  detachPorts(): void;
  register(handler: ClinicalCommandHandler): void;
  unregister(type: ClinicalCommandType): void;
  /**
   * Dispatch a command from any producer (UI, keyboard, voice, automation).
   * Source is retained in the result only — never passed to ports/Store.
   */
  dispatch(command: ClinicalCommand): Promise<ClinicalCommandResult>;
  /** Synchronous resolve without executing ports. */
  resolve(command: ClinicalCommand): ClinicalCommandResult;
}
