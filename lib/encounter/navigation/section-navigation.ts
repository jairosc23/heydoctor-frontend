/**
 * Encounter Navigation SSOT — section resolve + programmatic navigate.
 * Sole owner of encounter section scroll (rail, Signature, Continuity recovery, Foundation).
 */

import { getEncounterChromeMetrics } from "./chrome-metrics";

export const ENCOUNTER_SCROLL_ROOT_SELECTOR = "main";
export const ENCOUNTER_RAIL_SELECTOR = '[data-testid="clinical-navigation-rail"]';
export const ENCOUNTER_NAV_ACTIVE_OFFSET_PX = 16;

export type NavigateToEncounterSectionOptions = {
  behavior?: ScrollBehavior;
  rootSelector?: string;
  /** When true, skip focus after scroll. */
  skipFocus?: boolean;
};

function isRendered(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

export function resolveEncounterScrollRoot(
  rootSelector: string = ENCOUNTER_SCROLL_ROOT_SELECTOR,
): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const root = document.querySelector(rootSelector);
  return root instanceof HTMLElement ? root : null;
}

/**
 * Prefer a visible mount. Never fall back to display:none nodes —
 * scrolling a hidden section is a silent no-op (dead rail links).
 */
export function resolveEncounterSectionElement(
  sectionId: string,
): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const candidates = Array.from(
    document.querySelectorAll(`[id="${sectionId}"]`),
  ).filter((element): element is HTMLElement => element instanceof HTMLElement);
  return candidates.find(isRendered) ?? null;
}

export function resolveEncounterSectionElements(
  sectionIds: string[],
): HTMLElement[] {
  return sectionIds
    .map(resolveEncounterSectionElement)
    .filter((element): element is HTMLElement => element instanceof HTMLElement);
}

export function getEncounterChromeOffsetPx(): number {
  return getEncounterChromeMetrics().heightPx + ENCOUNTER_NAV_ACTIVE_OFFSET_PX;
}

function escapeSelectorValue(value: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function sectionScrollOffsetPx(element: HTMLElement, chromeOffset: number): number {
  const fromStyle = Number.parseFloat(getComputedStyle(element).scrollMarginTop);
  if (Number.isFinite(fromStyle) && fromStyle > 0) {
    return Math.max(chromeOffset, fromStyle);
  }
  return chromeOffset;
}

/** Bring the matching rail item into its own overflow (vertical or horizontal). */
export function revealEncounterRailItem(sectionId: string): void {
  if (typeof document === "undefined") return;
  const rails = document.querySelectorAll(ENCOUNTER_RAIL_SELECTOR);
  for (const rail of rails) {
    if (!(rail instanceof HTMLElement) || !isRendered(rail)) continue;
    const item = rail.querySelector(
      `[data-section-id="${escapeSelectorValue(sectionId)}"]`,
    );
    if (!(item instanceof HTMLElement) || !isRendered(item)) continue;
    if (typeof item.scrollIntoView !== "function") continue;
    item.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
}

/**
 * Canonical programmatic navigation for encounter sections.
 * Uses live chrome metrics + scroll root — never ad-hoc scrollIntoView for sections.
 * Returns false when the target is not laid out yet (caller should retry after soap tab).
 */
export function navigateToEncounterSection(
  sectionId: string,
  options: NavigateToEncounterSectionOptions = {},
): boolean {
  if (typeof window === "undefined") return false;
  const element = resolveEncounterSectionElement(sectionId);
  if (!element || !isRendered(element)) return false;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const behavior: ScrollBehavior =
    options.behavior ?? (prefersReducedMotion ? "auto" : "smooth");
  const root = resolveEncounterScrollRoot(
    options.rootSelector ?? ENCOUNTER_SCROLL_ROOT_SELECTOR,
  );
  const chromeOffset = sectionScrollOffsetPx(
    element,
    getEncounterChromeOffsetPx(),
  );

  if (root) {
    const rootRect = root.getBoundingClientRect();
    const elRect = element.getBoundingClientRect();
    const delta = elRect.top - rootRect.top - chromeOffset;
    if (Math.abs(delta) > 8) {
      root.scrollBy({ top: delta, behavior });
    }
  } else {
    const top =
      element.getBoundingClientRect().top + window.scrollY - chromeOffset;
    window.scrollTo({ top, behavior });
  }

  revealEncounterRailItem(sectionId);

  if (!options.skipFocus) {
    window.setTimeout(
      () => {
        element.focus({ preventScroll: true });
      },
      behavior === "smooth" ? 180 : 0,
    );
  }

  return true;
}
