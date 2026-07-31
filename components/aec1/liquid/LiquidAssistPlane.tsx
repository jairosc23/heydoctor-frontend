"use client";

import type { ReactNode } from "react";
import type {
  LiquidEncounterPhase,
  LiquidIntelSourceClass,
} from "@/lib/aec1/liquid-composition";
import { liquidAssistDisclosure } from "@/lib/aec1/liquid-composition";

export type LiquidAssistPlaneProps = {
  phase: LiquidEncounterPhase;
  /** Future M5/M6 card mount — never a second Copilot chat. */
  children?: ReactNode;
};

const SOURCE_HINTS: LiquidIntelSourceClass[] = ["MODEL", "DETERMINISTIC"];

/**
 * Assist plane seam for the Liquid shell.
 * Copilot remains ClinicalCopilotDrawer (MODEL plane).
 * W5 deterministic cards mount here in M5 — not clinical authority.
 */
export function LiquidAssistPlane({ phase, children }: LiquidAssistPlaneProps) {
  const disclosure = liquidAssistDisclosure(phase);
  if (disclosure === "hidden") {
    return (
      <aside
        data-testid="aec1-liquid-assist-plane"
        data-disclosure="hidden"
        data-authority="NON_AUTHORITY"
        hidden
        aria-hidden
      />
    );
  }

  return (
    <aside
      data-testid="aec1-liquid-assist-plane"
      data-disclosure={disclosure}
      data-authority="NON_AUTHORITY"
      data-planes={SOURCE_HINTS.join(",")}
      aria-label="Asistencia clínica (advisory)"
      role="complementary"
      style={{
        marginTop: 8,
        padding: disclosure === "collapsed" ? "6px 10px" : "10px 12px",
        borderTop: "1px solid var(--hd-color-border, #d0d7da)",
        background: "var(--hd-color-surface-muted, #f4f7f8)",
        fontSize: 12,
        color: "var(--hd-color-text-secondary, #445055)",
      }}
    >
      <div data-testid="aec1-liquid-assist-boundary">
        Assist plane · MODEL (Copilot drawer) + DETERMINISTIC (M5) · never Confirm/Emit
      </div>
      {disclosure === "expanded" && children ? (
        <div data-testid="aec1-liquid-assist-cards">{children}</div>
      ) : null}
    </aside>
  );
}
