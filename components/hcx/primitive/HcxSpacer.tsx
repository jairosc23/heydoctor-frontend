import type { HTMLAttributes } from "react";

export type HcxSpacerProps = HTMLAttributes<HTMLDivElement> & {
  size?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  axis?: "y" | "x";
};

/** Primitive spacer — layout only. */
export function HcxSpacer({ size = 4, axis = "y", style, ...rest }: HcxSpacerProps) {
  const value = `var(--hcx-space-${size})`;
  return (
    <div
      aria-hidden
      style={{
        width: axis === "x" ? value : undefined,
        height: axis === "y" ? value : undefined,
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    />
  );
}
