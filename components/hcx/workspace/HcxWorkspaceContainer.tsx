import type { ReactNode } from "react";

export type HcxWorkspaceContainerProps = {
  children?: ReactNode;
  /** Landmark label for main workspace. */
  label?: string;
};

/** Primary workspace container — main landmark. */
export function HcxWorkspaceContainer({
  children,
  label = "Área de trabajo",
}: HcxWorkspaceContainerProps) {
  return (
    <main
      id="hcx-workspace-main"
      role="main"
      aria-label={label}
      data-testid="hcx-workspace-container"
      tabIndex={-1}
      style={{
        flex: 1,
        minWidth: 0,
        background: "var(--hcx-color-bg-canvas)",
        padding: "var(--hcx-space-4)",
        overflow: "auto",
      }}
    >
      {children}
    </main>
  );
}
