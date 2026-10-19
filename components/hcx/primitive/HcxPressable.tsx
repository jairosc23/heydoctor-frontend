import type { ButtonHTMLAttributes, ReactNode } from "react";

export type HcxPressableProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode;
};

/**
 * Primitive pressable — unstyled interactive atom.
 * Foundation Button composes this; no clinical verbs.
 */
export function HcxPressable({
  children,
  className,
  type = "button",
  ...rest
}: HcxPressableProps) {
  return (
    <button
      type={type}
      className={["hcx-focus-ring", className].filter(Boolean).join(" ")}
      {...rest}
    >
      {children}
    </button>
  );
}
