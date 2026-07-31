import type { CSSProperties, ReactNode } from "react";

export type HcxWorkspaceContainerProps = {
  children?: ReactNode;
  /** Landmark label for main workspace. */
  label?: string;
  /**
   * When true (default), render the primary `<main>` landmark.
   * Set false when already nested under a host shell landmark (e.g. PanelLayout)
   * so Liquid/HCX composition does not introduce a second main.
   */
  asMainLandmark?: boolean;
};

const containerStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: "var(--hcx-color-bg-canvas)",
  padding: "var(--hcx-space-4)",
  overflow: "auto",
};

/** Primary workspace container — main landmark by default. */
export function HcxWorkspaceContainer({
  children,
  label = "Área de trabajo",
  asMainLandmark = true,
}: HcxWorkspaceContainerProps) {
  if (!asMainLandmark) {
    return (
      <div
        id="hcx-workspace-surface"
        aria-label={label}
        data-testid="hcx-workspace-container"
        data-hcx-landmark="composition"
        tabIndex={-1}
        style={containerStyle}
      >
        {children}
      </div>
    );
  }

  return (
    <main
      id="hcx-workspace-main"
      role="main"
      aria-label={label}
      data-testid="hcx-workspace-container"
      data-hcx-landmark="main"
      tabIndex={-1}
      style={containerStyle}
    >
      {children}
    </main>
  );
}
