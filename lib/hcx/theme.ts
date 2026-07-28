/**
 * HCX theme helpers — Foundation layer only.
 * No clinical / HAB / emission semantics.
 */

export type HcxDensity = "calm" | "staff";

export type HcxBreakpoint = "sm" | "md" | "lg" | "xl";

/** Brand spine from HCX Foundations — never purple AI themes. */
export const HCX_BRAND_PRIMARY = "#078A92";

export function hcxDensityClass(density: HcxDensity = "calm"): string {
  return density === "staff" ? "hcx-density-staff" : "hcx-density-calm";
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
