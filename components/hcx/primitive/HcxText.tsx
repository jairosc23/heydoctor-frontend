import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

export type HcxTextVariant =
  | "display"
  | "title"
  | "section"
  | "body"
  | "bodySm"
  | "meta"
  | "micro";

export type HcxTextProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  as?: "p" | "span" | "h1" | "h2" | "h3" | "label" | "div";
  variant?: HcxTextVariant;
  tone?: "primary" | "secondary" | "muted" | "onBrand" | "link";
  weight?: "regular" | "medium" | "semibold" | "bold";
  mono?: boolean;
};

const sizeMap: Record<HcxTextVariant, string> = {
  display: "var(--hcx-font-size-display)",
  title: "var(--hcx-font-size-title)",
  section: "var(--hcx-font-size-section)",
  body: "var(--hcx-font-size-body)",
  bodySm: "var(--hcx-font-size-body-sm)",
  meta: "var(--hcx-font-size-meta)",
  micro: "var(--hcx-font-size-micro)",
};

const toneMap = {
  primary: "var(--hcx-color-text-primary)",
  secondary: "var(--hcx-color-text-secondary)",
  muted: "var(--hcx-color-text-muted)",
  onBrand: "var(--hcx-color-text-on-brand)",
  link: "var(--hcx-color-text-link)",
};

const weightMap = {
  regular: "var(--hcx-font-weight-regular)",
  medium: "var(--hcx-font-weight-medium)",
  semibold: "var(--hcx-font-weight-semibold)",
  bold: "var(--hcx-font-weight-bold)",
};

/**
 * Primitive text — typography only, no clinical copy ownership.
 */
export function HcxText({
  children,
  as: Tag = "p",
  variant = "body",
  tone = "primary",
  weight = "regular",
  mono = false,
  style,
  className,
  ...rest
}: HcxTextProps) {
  const styles: CSSProperties = {
    margin: 0,
    fontFamily: mono
      ? "var(--hcx-font-family-mono)"
      : variant === "display"
        ? "var(--hcx-font-family-display)"
        : "var(--hcx-font-family-ui)",
    fontSize: sizeMap[variant],
    fontWeight: weightMap[weight],
    color: toneMap[tone],
    lineHeight:
      variant === "display" || variant === "title"
        ? "var(--hcx-line-height-tight)"
        : "var(--hcx-line-height-normal)",
    letterSpacing: variant === "micro" ? "var(--hcx-letter-spacing-label)" : undefined,
    textTransform: variant === "micro" ? "uppercase" : undefined,
    ...style,
  };

  return (
    <Tag className={className} style={styles} {...rest}>
      {children}
    </Tag>
  );
}
