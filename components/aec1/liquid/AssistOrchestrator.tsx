"use client";

import type { ReactNode } from "react";
import {
  ASSIST_ORCHESTRATOR_ASSERTIONS,
  planAssistOrchestration,
} from "@/lib/aec1/assist-orchestrator";
import type { LiquidEncounterPhase } from "@/lib/aec1/liquid-composition";
import { W5AdvisoryCards } from "./W5AdvisoryCards";

export type AssistOrchestratorProps = {
  phase: LiquidEncounterPhase;
  consultationId?: string;
  disclosure: "collapsed" | "expanded";
  /** Optional extra assist mounts (never a second Copilot chat). */
  children?: ReactNode;
};

/**
 * M6.1 — Assist Orchestrator (SSOT) render composition.
 * DETERMINISTIC → existing W5AdvisoryCards.
 * MODEL → registered, no presence cards yet (M6.2).
 * AUTHORITY → outside Assist rendering.
 * EXTERNAL → interface only.
 */
export function AssistOrchestrator({
  phase,
  consultationId,
  disclosure,
  children,
}: AssistOrchestratorProps) {
  const plan = planAssistOrchestration({
    phase,
    consultationId,
  });

  return (
    <div
      data-testid="aec1-assist-orchestrator"
      data-ssot={ASSIST_ORCHESTRATOR_ASSERTIONS.ssot}
      data-disclosure={disclosure}
      data-registered={plan.registeredSources.join(",")}
      data-authority-outside={
        ASSIST_ORCHESTRATOR_ASSERTIONS.authorityOutsideAssistRender
          ? "true"
          : "false"
      }
      data-external-interface-only={
        ASSIST_ORCHESTRATOR_ASSERTIONS.externalInterfaceOnly ? "true" : "false"
      }
      data-assist-never-authority={
        ASSIST_ORCHESTRATOR_ASSERTIONS.assistNeverConfirmsOrEmits
          ? "true"
          : "false"
      }
    >
      {plan.renderSlots.map((slot) => {
        if (slot.slot === "deterministic") {
          return (
            <div
              key="deterministic"
              data-testid="aec1-assist-slot-deterministic"
              data-source="DETERMINISTIC"
            >
              <W5AdvisoryCards
                consultationId={consultationId}
                disclosure={disclosure}
              />
            </div>
          );
        }
        if (slot.slot === "model_presence") {
          // M6.1: provider registered; no MODEL cards / Copilot UX changes.
          return (
            <div
              key="model"
              data-testid="aec1-assist-slot-model"
              data-source="MODEL"
              data-enabled="false"
              hidden
              aria-hidden
            />
          );
        }
        return null;
      })}
      {children}
    </div>
  );
}
