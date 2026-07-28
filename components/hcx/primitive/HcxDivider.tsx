import type { HTMLAttributes } from "react";

export type HcxDividerProps = HTMLAttributes<HTMLHRElement> & {
  soft?: boolean;
};

/** Primitive divider. */
export function HcxDivider({ soft = true, style, ...rest }: HcxDividerProps) {
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px solid ${
          soft
            ? "var(--hcx-color-border-subtle)"
            : "var(--hcx-color-neutral-200)"
        }`,
        margin: "var(--hcx-space-4) 0",
        ...style,
      }}
      {...rest}
    />
  );
}
