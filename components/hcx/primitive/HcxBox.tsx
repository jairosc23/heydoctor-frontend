import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type HcxBoxProps = HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
  as?: "div" | "section" | "article" | "main" | "aside" | "header" | "footer";
  padding?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  display?: "block" | "flex" | "grid" | "inline-flex";
  direction?: "row" | "column";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
};

const space = (n: number) => `var(--hcx-space-${n})`;

/**
 * Primitive layout box — no clinical meaning.
 */
export function HcxBox({
  children,
  as: Tag = "div",
  padding,
  gap,
  display = "block",
  direction = "column",
  align,
  justify,
  style,
  className,
  ...rest
}: HcxBoxProps) {
  const styles: CSSProperties = {
    display,
    flexDirection: display === "flex" || display === "inline-flex" ? direction : undefined,
    alignItems: align,
    justifyContent:
      justify === "between" ? "space-between" : justify,
    padding: padding !== undefined ? space(padding) : undefined,
    gap: gap !== undefined ? space(gap) : undefined,
    ...style,
  };

  return (
    <Tag className={className} style={styles} {...rest}>
      {children}
    </Tag>
  );
}
