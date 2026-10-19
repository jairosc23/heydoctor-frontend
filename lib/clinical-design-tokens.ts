import { cn } from "@/lib/utils";

export const HD_MOTION_MS = {
  fast: 150,
  base: 200,
  slow: 250,
} as const;

export type ClinicalDepth = 1 | 2 | 3 | 4 | 5;

export type ClinicalDensity = "compact" | "comfortable" | "spacious";

export const CLINICAL_DEPTH_STYLES: Record<ClinicalDepth, string> = {
  1: "clinical-depth-1 bg-hd-surface-chrome shadow-hd-2",
  2: "clinical-depth-2 bg-hd-surface-raised shadow-hd-1",
  3: "clinical-depth-3 bg-hd-surface-raised shadow-hd-2",
  4: "clinical-depth-4 bg-hd-surface-muted shadow-hd-1",
  5: "clinical-depth-5 bg-hd-surface-muted/80 shadow-none",
};

export const CLINICAL_DENSITY_PADDING: Record<ClinicalDensity, string> = {
  compact: "p-hd-3",
  comfortable: "p-hd-4",
  spacious: "p-hd-5",
};

export const CLINICAL_SURFACE_BASE =
  "clinical-surface rounded-hd-lg border border-hd-border-subtle transition-all duration-hd-base ease-out";

export const CLINICAL_CARD_BASE =
  "clinical-card rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised shadow-hd-1 transition-shadow duration-hd-base ease-out hover:shadow-hd-2";

export const CLINICAL_PANEL_BASE =
  "clinical-panel min-w-0 transition-all duration-hd-base ease-out";

export const CLINICAL_SECTION_TITLE =
  "text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export const CLINICAL_TAB_BASE =
  "clinical-tab shrink-0 border-b-2 px-hd-3 py-hd-2 text-xs font-semibold transition-all duration-hd-fast ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1";

export const CLINICAL_TAB_ACTIVE =
  "border-primary text-primary bg-primaryLight/30";

export const CLINICAL_TAB_INACTIVE =
  "border-transparent text-slate-500 hover:border-slate-200 hover:text-slate-700";

export const CLINICAL_INTERACTIVE =
  "clinical-interactive transition-all duration-hd-base ease-out";

export function clinicalSurfaceClass(
  depth: ClinicalDepth = 2,
  options?: {
    focusPrimary?: boolean;
    secondary?: boolean;
    className?: string;
  },
): string {
  return cn(
    CLINICAL_SURFACE_BASE,
    CLINICAL_DEPTH_STYLES[depth],
    options?.focusPrimary && "clinical-focus-primary",
    options?.secondary && "clinical-depth-secondary",
    options?.className,
  );
}

export function clinicalPanelClass(
  depth: ClinicalDepth = 3,
  density: ClinicalDensity = "comfortable",
  options?: {
    focusPrimary?: boolean;
    className?: string;
  },
): string {
  return cn(
    CLINICAL_PANEL_BASE,
    CLINICAL_DEPTH_STYLES[depth],
    CLINICAL_DENSITY_PADDING[density],
    "rounded-hd-lg border border-hd-border-subtle",
    options?.focusPrimary && "clinical-focus-primary",
    options?.className,
  );
}

export function clinicalCardClass(className?: string): string {
  return cn(CLINICAL_CARD_BASE, "p-hd-3", className);
}

export function clinicalSectionClass(className?: string): string {
  return cn("clinical-section space-y-hd-2", className);
}

export function clinicalTabClass(active: boolean, className?: string): string {
  return cn(
    CLINICAL_TAB_BASE,
    active ? CLINICAL_TAB_ACTIVE : CLINICAL_TAB_INACTIVE,
    className,
  );
}
