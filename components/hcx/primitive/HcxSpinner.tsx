import type { HTMLAttributes } from "react";

export type HcxSpinnerProps = HTMLAttributes<HTMLDivElement> & {
  label?: string;
  size?: number;
};

/** Primitive loading spinner — decorative; provide label for a11y. */
export function HcxSpinner({
  label = "Cargando",
  size = 20,
  style,
  ...rest
}: HcxSpinnerProps) {
  return (
    <div
      role="status"
      style={{ display: "inline-flex", alignItems: "center", gap: 8, ...style }}
      {...rest}
    >
      <span
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: "2px solid var(--hcx-color-border-subtle)",
          borderTopColor: "var(--hcx-color-brand-500)",
          animation: "hcx-spin var(--hcx-motion-duration-slow) linear infinite",
          display: "inline-block",
        }}
      />
      <span className="hcx-visually-hidden">{label}</span>
    </div>
  );
}
