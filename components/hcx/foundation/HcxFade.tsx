import type { ReactNode } from "react";

export type HcxFadeProps = {
  children?: ReactNode;
  show?: boolean;
};

/**
 * Motion primitive — opacity fade using HCX duration tokens.
 * Respects prefers-reduced-motion via token zeroing.
 */
export function HcxFade({ children, show = true }: HcxFadeProps) {
  return (
    <div
      style={{
        opacity: show ? 1 : 0,
        transition: `opacity var(--hcx-motion-duration-base) var(--hcx-motion-easing-standard)`,
      }}
    >
      {children}
    </div>
  );
}
