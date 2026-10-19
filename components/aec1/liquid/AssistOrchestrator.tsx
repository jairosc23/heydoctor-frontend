"use client";

import type { ReactNode } from "react";
import {
  ASSIST_ORCHESTRATOR_ASSERTIONS,
  planAssistOrchestration,
} from "@/lib/aec1/assist-orchestrator";
import type { LiquidEncounterPhase } from "@/lib/aec1/liquid-composition";
import { CopilotPresence } from "./CopilotPresence";
import { W5AdvisoryCards } from "./W5AdvisoryCards";

export type AssistOrchestratorProps = {
  phase: LiquidEncounterPhase;
  consultationId?: string;
  /** Opens existing ClinicalCopilotDrawer (never a second drawer). */
  onOpenCopilot?: () => void;
  copilotOpen?: boolean;
  /** Optional extra assist mounts (never a second Copilot chat). */
  children?: ReactNode;
};

/**
 * Assist Orchestrator (SSOT) render composition.
 * M6.3: disclosure + fatigue + MODEL/DETERMINISTIC visibility come from
 * `planAssistOrchestration` only — no local policy duplicates.
 */
export function AssistOrchestrator({
  phase,
  consultationId,
  onOpenCopilot,
  copilotOpen,
  children,
}: AssistOrchestratorProps) {
  const plan = planAssistOrchestration({
    phase,
    consultationId,
  });

  if (!plan.planeVisible || plan.disclosure === "hidden") {
    return (
      <div
        data-testid="aec1-assist-orchestrator"
        data-ssot={ASSIST_ORCHESTRATOR_ASSERTIONS.ssot}
        data-disclosure="hidden"
        data-plane-visible="false"
        hidden
        aria-hidden
      />
    );
  }

  const disclosure = plan.disclosure;

  return (
    <div
      data-testid="aec1-assist-orchestrator"
      data-ssot={ASSIST_ORCHESTRATOR_ASSERTIONS.ssot}
      data-disclosure={disclosure}
      data-plane-visible="true"
      data-compact={plan.compact ? "true" : "false"}
      data-expand-list={plan.expandList ? "true" : "false"}
      data-fatigue-max={String(plan.deterministicMaxVisible)}
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
      data-max-one-model={
        ASSIST_ORCHESTRATOR_ASSERTIONS.maxOneModelPresence ? "true" : "false"
      }
      data-disclosure-fatigue-ssot={
        ASSIST_ORCHESTRATOR_ASSERTIONS.disclosureAndFatigueSsot
          ? "true"
          : "false"
      }
    >
      {plan.renderSlots.map((slot) => {
        if (slot.slot === "deterministic") {
          if (!plan.showDeterministicSlot) return null;
          return (
            <div
              key="deterministic"
              data-testid="aec1-assist-slot-deterministic"
              data-source="DETERMINISTIC"
            >
              <W5AdvisoryCards
                consultationId={consultationId}
                disclosure={disclosure}
                maxVisible={plan.deterministicMaxVisible}
              />
            </div>
          );
        }
        if (slot.slot === "model_presence") {
          if (!slot.enabled || !plan.showModelPresence) {
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
          return (
            <div
              key="model"
              data-testid="aec1-assist-slot-model"
              data-source="MODEL"
              data-enabled="true"
            >
              <CopilotPresence
                disclosure={disclosure}
                onOpenCopilot={onOpenCopilot}
                copilotOpen={copilotOpen}
              />
            </div>
          );
        }
        return null;
      })}
      {children}
    </div>
  );
}
