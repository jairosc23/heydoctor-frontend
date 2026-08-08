/**
 * Encounter Navigation SSOT — section resolve + programmatic navigate.
 * Sole owner of encounter section scroll (rail, Signature, Continuity recovery, Foundation).
 */

import { getEncounterChromeMetrics } from "./chrome-metrics";

export const ENCOUNTER_SCROLL_ROOT_SELECTOR = "main";
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
  const chromeOffset = getEncounterChromeOffsetPx();

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
