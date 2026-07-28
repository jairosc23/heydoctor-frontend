import type { ReactNode } from "react";
import { HcxButton } from "./HcxButton";
import { HcxText } from "../primitive/HcxText";

export type HcxModalShellProps = {
  open: boolean;
  title: string;
  children?: ReactNode;
  onClose: () => void;
  /** Generic dismiss label — not HAB Abort. */
  closeLabel?: string;
};

/**
 * Foundation Modal shell — generic dialog chrome.
 * Not HAB ConfirmationMount.
 */
export function HcxModalShell({
  open,
  title,
  children,
  onClose,
  closeLabel = "Cerrar",
}: HcxModalShellProps) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      data-testid="hcx-modal-shell"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(2, 44, 44, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--hcx-space-4)",
        zIndex: 50,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hcx-modal-title"
        style={{
          background: "var(--hcx-color-bg-raised)",
          borderRadius: "var(--hcx-radius-lg)",
          boxShadow: "var(--hcx-elevation-3)",
          maxWidth: 480,
          width: "100%",
          padding: "var(--hcx-space-6)",
        }}
      >
        <HcxText as="h2" id="hcx-modal-title" variant="section" weight="semibold">
          {title}
        </HcxText>
        <div style={{ marginTop: "var(--hcx-space-4)" }}>{children}</div>
        <div
          style={{
            marginTop: "var(--hcx-space-6)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <HcxButton variant="secondary" onClick={onClose} data-testid="hcx-modal-close">
            {closeLabel}
          </HcxButton>
        </div>
      </div>
    </div>
  );
}
