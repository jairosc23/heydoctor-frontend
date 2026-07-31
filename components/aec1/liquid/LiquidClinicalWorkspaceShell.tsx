"use client";

import type { ReactNode } from "react";
import {
  HcxWorkspaceContainer,
  HcxWorkspaceShellGate,
} from "@/components/hcx/workspace";
import {
  LIQUID_AUTHORITY_ASSERTIONS,
  planLiquidRegions,
  resolveLiquidEncounterPhase,
  type LiquidClinicianRole,
} from "@/lib/aec1/liquid-composition";
import { isAec1LiquidSpineEnabled } from "@/lib/aec1/liquid-flags";
import { LiquidAssistPlane } from "./LiquidAssistPlane";

export type LiquidClinicalWorkspaceShellProps = {
  children: ReactNode;
  consultationId: string;
  /** Consultation status string from production encounter. */
  encounterStatus?: string | null;
  isSigned?: boolean;
  isLocked?: boolean;
  degraded?: boolean;
  role?: LiquidClinicianRole;
  /** Override soak (tests). Default: HCX workspace shell flag. */
  enabled?: boolean;
};

/**
 * AEC-1 M4 Liquid spine — WRAP/ADAPT ConsultationWorkspace in place.
 * Shell of record remains ConsultationWorkspace (ADR-AEC1-001).
 * When soak flag OFF, children render unchanged (production-safe default).
 */
export function LiquidClinicalWorkspaceShell({
  children,
  consultationId,
  encounterStatus,
  isSigned,
  isLocked,
  degraded,
  role = "doctor",
  enabled,
}: LiquidClinicalWorkspaceShellProps) {
  const on = enabled ?? isAec1LiquidSpineEnabled();
  const phase = resolveLiquidEncounterPhase({
    status: encounterStatus,
    isSigned,
    isLocked,
    degraded,
  });
  const regions = planLiquidRegions({ phase, role });

  if (!on) {
    return (
      <div
        data-testid="aec1-liquid-passthrough"
        data-liquid-enabled="false"
        data-shell={LIQUID_AUTHORITY_ASSERTIONS.singleWorkspaceShell}
      >
        {children}
      </div>
    );
  }

  return (
    <HcxWorkspaceShellGate enabled>
      <div
        data-testid="aec1-liquid-clinical-workspace"
        data-liquid-enabled="true"
        data-shell={LIQUID_AUTHORITY_ASSERTIONS.singleWorkspaceShell}
        data-consultation-id={consultationId}
        data-encounter-phase={phase}
        data-role={role}
        data-no-second-workspace={
          LIQUID_AUTHORITY_ASSERTIONS.noSecondWorkspaceRoute ? "true" : "false"
        }
        data-assist-never-authority={
          LIQUID_AUTHORITY_ASSERTIONS.assistNeverConfirmsOrEmits
            ? "true"
            : "false"
        }
      >
        <HcxWorkspaceContainer label="Área de trabajo clínico">
          {regions.interrupt.visible ? (
            <div
              data-testid="aec1-liquid-interrupt-lane"
              data-emphasis={regions.interrupt.emphasis}
              role="region"
              aria-label="Alertas e interrupciones clínicas"
            />
          ) : null}

          <div
            data-testid="aec1-liquid-work-surface"
            data-emphasis={regions.work.emphasis}
            role="region"
            aria-label="Superficie de trabajo clínico"
          >
            {children}
          </div>

          {regions.assist.visible ? (
            <LiquidAssistPlane phase={phase} />
          ) : (
            <LiquidAssistPlane phase="degraded" />
          )}

          {/* Authority mount stays HAB/ConfirmationMount outside this wrap — landmark only */}
          <div
            data-testid="aec1-liquid-authority-seam"
            data-emphasis={regions.authority.emphasis}
            data-owner="HAB"
            hidden
            aria-hidden
          >
            authority-mount-seam
          </div>
        </HcxWorkspaceContainer>
      </div>
    </HcxWorkspaceShellGate>
  );
}
