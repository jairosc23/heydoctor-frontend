/**
 * CP-27 — ClinicalCommandDispatcher.
 * Registers handlers and resolves commands into effects (no port execution).
 */

import type {
  ClinicalCommandDispatcher,
  ClinicalCommandHandler,
} from "./contracts";
import type {
  ClinicalCommand,
  ClinicalCommandResult,
  ClinicalCommandType,
} from "./types";

export function createClinicalCommandDispatcher(): ClinicalCommandDispatcher {
  const handlers = new Map<ClinicalCommandType, ClinicalCommandHandler>();

  return {
    register(handler: ClinicalCommandHandler) {
      handlers.set(handler.type, handler);
    },

    unregister(type: ClinicalCommandType) {
      handlers.delete(type);
    },

    hasHandler(type: ClinicalCommandType) {
      return handlers.has(type);
    },

    resolve(command: ClinicalCommand): ClinicalCommandResult {
      const handler = handlers.get(command.type);
      if (!handler) {
        return {
          commandId: command.commandId,
          type: command.type,
          source: command.source,
          status: "unhandled",
          effects: [],
          executed: false,
          reason: `no_handler_for_${command.type}`,
        };
      }

      const output = handler.handle(command);
      if (!Array.isArray(output)) {
        return {
          commandId: command.commandId,
          type: command.type,
          source: command.source,
          status: "rejected",
          effects: [],
          executed: false,
          reason: output.reason,
        };
      }

      return {
        commandId: command.commandId,
        type: command.type,
        source: command.source,
        status: "handled",
        effects: output,
        executed: false,
        reason: null,
      };
    },
  };
}
