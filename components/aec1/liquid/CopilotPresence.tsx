"use client";

import { W5_CLINICAL_AUTHORITY } from "@/lib/aec1/w5-clinical-steward-api";

export type CopilotPresenceProps = {
  disclosure: "collapsed" | "expanded";
  /** Opens the existing ClinicalCopilotDrawer — never mounts a second drawer. */
  onOpenCopilot?: () => void;
  /** Optional: whether drawer is already open (visual active state only). */
  copilotOpen?: boolean;
};

/**
 * M6.2 — thin MODEL presence inside Assist Orchestrator.
 * One compact NON_AUTHORITY control that opens the existing Copilot drawer.
 * Not a chat. Not MODEL advisory cards. Not clinical authority.
 */
export function CopilotPresence({
  disclosure,
  onOpenCopilot,
  copilotOpen = false,
}: CopilotPresenceProps) {
  const compact = disclosure === "collapsed";

  return (
    <div
      data-testid="aec1-copilot-presence"
      data-plane="MODEL"
      data-authority={W5_CLINICAL_AUTHORITY}
      data-disclosure={disclosure}
      data-open={copilotOpen ? "true" : "false"}
      role="group"
      aria-label="Presencia Copilot (MODEL, advisory)"
      style={{
        marginTop: compact ? 4 : 8,
        padding: compact ? "4px 8px" : "8px 10px",
        border: "1px dashed var(--hd-color-border, #d0d7da)",
        borderRadius: 6,
        background: "var(--hd-color-surface, #fff)",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: compact ? 6 : 8,
        fontSize: compact ? 11 : 12,
      }}
    >
      <span
        data-testid="aec1-copilot-presence-badge"
        style={{
          fontWeight: 600,
          letterSpacing: 0.02,
          color: "var(--hd-color-text-secondary, #445055)",
        }}
      >
        MODEL · {W5_CLINICAL_AUTHORITY}
      </span>
      {!compact ? (
        <span data-testid="aec1-copilot-presence-summary">
          Asistencia generativa · provisional · no confirma ni emite
        </span>
      ) : null}
      <button
        type="button"
        data-testid="aec1-copilot-presence-open"
        data-hab="false"
        onClick={() => onOpenCopilot?.()}
        disabled={!onOpenCopilot}
        aria-pressed={copilotOpen}
        style={{
          marginLeft: "auto",
          padding: compact ? "2px 8px" : "4px 10px",
          borderRadius: 4,
          border: "1px solid var(--hd-color-border, #c5ced1)",
          background: copilotOpen
            ? "var(--hd-color-surface-muted, #eef2f3)"
            : "var(--hd-color-surface, #fff)",
          cursor: onOpenCopilot ? "pointer" : "not-allowed",
          fontSize: "inherit",
          fontWeight: 600,
        }}
      >
        {copilotOpen ? "Copilot abierto" : "Abrir Copilot"}
      </button>
    </div>
  );
}
