import type { ReactNode, SVGProps } from "react";

export type HcxIconName = "close" | "check" | "warning" | "info" | "search" | "menu";

export type HcxIconProps = SVGProps<SVGSVGElement> & {
  name: HcxIconName;
  size?: 16 | 20 | 24 | 32;
  title?: string;
};

const paths: Record<HcxIconName, ReactNode> = {
  close: (
    <path
      d="M6 6l12 12M18 6L6 18"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
  ),
  check: (
    <path
      d="M5 12l5 5L19 7"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  ),
  warning: (
    <>
      <path
        d="M12 3l9 16H3L12 3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.75" fill="currentColor" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="7" r="0.75" fill="currentColor" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" fill="none" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </>
  ),
};

/**
 * Foundation iconography primitive — line icons, currentColor.
 * Chrome/nav set only in Phase 12 (no clinical metaphor expansion required).
 */
export function HcxIcon({ name, size = 24, title, ...rest }: HcxIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
