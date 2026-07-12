/**
 * CP-27 — ClinicalCommandBus.
 * Unified entry for UI / keyboard / mouse / shortcuts / future Voice.
 */

import type {
  ClinicalCommandBus,
  ClinicalCommandDispatcher,
  ClinicalCommandHandler,
  ClinicalCommandPorts,
} from "./contracts";
import { createClinicalCommandDispatcher } from "./dispatcher";
import { executeClinicalCommandEffects } from "./execute-effects";
import { createDefaultClinicalCommandHandlers } from "./handlers";
import type { ClinicalCommand, ClinicalCommandResult } from "./types";

export type CreateClinicalCommandBusOptions = {
  dispatcher?: ClinicalCommandDispatcher;
  /** When true (default), registers the eight foundation handlers. */
  registerDefaults?: boolean;
  ports?: ClinicalCommandPorts;
};

export function createClinicalCommandBus(
  options: CreateClinicalCommandBusOptions = {},
): ClinicalCommandBus {
  const dispatcher =
    options.dispatcher ?? createClinicalCommandDispatcher();
  let ports: ClinicalCommandPorts | null = options.ports ?? null;

  if (options.registerDefaults !== false) {
    for (const handler of createDefaultClinicalCommandHandlers()) {
      dispatcher.register(handler);
    }
  }

  const bus: ClinicalCommandBus = {
    get dispatcher() {
      return dispatcher;
    },

    attachPorts(nextPorts: ClinicalCommandPorts) {
      ports = nextPorts;
    },

    detachPorts() {
      ports = null;
    },

    register(handler: ClinicalCommandHandler) {
      dispatcher.register(handler);
    },

    unregister(type) {
      dispatcher.unregister(type);
    },

    resolve(command: ClinicalCommand): ClinicalCommandResult {
      return dispatcher.resolve(command);
    },

    async dispatch(command: ClinicalCommand): Promise<ClinicalCommandResult> {
      const resolved = dispatcher.resolve(command);
      if (resolved.status !== "handled" || resolved.effects.length === 0) {
        return resolved;
      }

      const executed = await executeClinicalCommandEffects(
        resolved.effects,
        ports,
      );

      return {
        ...resolved,
        executed,
        reason: executed
          ? null
          : ports
            ? "ports_missing_for_effects"
            : "ports_not_attached",
      };
    },
  };

  return bus;
}
