/**
 * CP-27 — Execute ClinicalCommandEffect via injected ports.
 * Ports must not receive command.source — Store stays origin-agnostic.
 */

import type { ClinicalCommandPorts } from "./contracts";
import type { ClinicalCommandEffect } from "./types";

export async function executeClinicalCommandEffects(
  effects: ClinicalCommandEffect[],
  ports: ClinicalCommandPorts | null,
): Promise<boolean> {
  if (!ports || effects.length === 0) {
    return false;
  }

  let executed = false;

  for (const effect of effects) {
    switch (effect.kind) {
      case "bootstrap_session":
        if (ports.bootstrapSession) {
          await ports.bootstrapSession({
            consultationId: effect.consultationId,
            patientId: effect.patientId,
            appointmentId: effect.appointmentId,
          });
          executed = true;
        }
        break;
      case "refresh_workspace":
        if (ports.refreshWorkspace) {
          await ports.refreshWorkspace();
          executed = true;
        }
        break;
      case "approve_action":
        if (ports.approveAction) {
          await ports.approveAction(effect.actionId);
          executed = true;
        }
        break;
      case "reject_action":
        if (ports.rejectAction) {
          await ports.rejectAction(effect.actionId, effect.reason);
          executed = true;
        }
        break;
      case "open_panel":
        if (ports.openPanel) {
          await ports.openPanel(effect.panel);
          executed = true;
        }
        break;
      default: {
        const _exhaustive: never = effect;
        void _exhaustive;
        break;
      }
    }
  }

  return executed;
}
