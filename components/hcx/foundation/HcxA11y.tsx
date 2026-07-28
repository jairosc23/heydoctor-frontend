import type { ReactNode } from "react";

/** Accessibility primitive — visually hidden text for SR. */
export function HcxVisuallyHidden({ children }: { children: ReactNode }) {
  return <span className="hcx-visually-hidden">{children}</span>;
}

export type HcxLiveRegionProps = {
  children?: ReactNode;
  politeness?: "polite" | "assertive";
  atomic?: boolean;
};

/** Accessibility primitive — live region shell (generic). */
export function HcxLiveRegion({
  children,
  politeness = "polite",
  atomic = true,
}: HcxLiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      data-testid="hcx-live-region"
    >
      {children}
    </div>
  );
}
