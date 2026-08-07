"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  subscribeEncounterChromeMetrics,
  type EncounterChromeMetrics,
} from "@/lib/encounter/navigation/chrome-metrics";
import {
  ENCOUNTER_NAV_ACTIVE_OFFSET_PX,
  ENCOUNTER_SCROLL_ROOT_SELECTOR,
  getEncounterChromeOffsetPx,
  navigateToEncounterSection,
  resolveEncounterScrollRoot,
  resolveEncounterSectionElements,
} from "@/lib/encounter/navigation/section-navigation";

export interface EncounterSectionNavSection {
  id: string;
}

export interface UseEncounterSectionNavigationOptions {
  enabled?: boolean;
  rootSelector?: string;
}

export interface UseEncounterSectionNavigationResult {
  activeSectionId: string | null;
  /** Returns false when the section is not laid out yet (e.g. chart still hidden). */
  navigateToSection: (sectionId: string) => boolean;
  chromeMetrics: EncounterChromeMetrics;
}

/**
 * Encounter Navigation SSOT hook.
 * - Single navigate API
 * - Live chrome metrics
 * - IntersectionObserver re-subscribes when chrome version changes
 */
export function useEncounterSectionNavigation(
  sections: EncounterSectionNavSection[],
  options: UseEncounterSectionNavigationOptions = {},
): UseEncounterSectionNavigationResult {
  const {
    enabled = true,
    rootSelector = ENCOUNTER_SCROLL_ROOT_SELECTOR,
  } = options;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const [chromeMetrics, setChromeMetrics] = useState<EncounterChromeMetrics>({
    heightPx: 88,
    version: 0,
  });
  const activeRef = useRef<string | null>(activeSectionId);
  const navigatingLockRef = useRef(false);
  const sectionIdKey = useMemo(
    () => sections.map((section) => section.id).join("|"),
    [sections],
  );

  const setActiveIfChanged = useCallback((sectionId: string | null) => {
    if (navigatingLockRef.current) return;
    if (activeRef.current === sectionId) return;
    activeRef.current = sectionId;
    setActiveSectionId(sectionId);
  }, []);

  useEffect(() => {
    activeRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    return subscribeEncounterChromeMetrics(setChromeMetrics);
  }, []);

  useEffect(() => {
    const sectionIds = sectionIdKey ? sectionIdKey.split("|") : [];
    if (!enabled || typeof window === "undefined" || sectionIds.length === 0) {
      setActiveIfChanged(sectionIds[0] ?? null);
      return;
    }

    const root = resolveEncounterScrollRoot(rootSelector);
    const elements = resolveEncounterSectionElements(sectionIds);
    if (elements.length === 0) {
      setActiveIfChanged(sectionIds[0] ?? null);
      return;
    }

    const pickActive = () => {
      if (navigatingLockRef.current) return;
      const chromeOffset = getEncounterChromeOffsetPx();
      const rootTop = root?.getBoundingClientRect().top ?? 0;
      const activationLine = rootTop + chromeOffset;
      let best: { id: string; distance: number } | null = null;

      for (const element of elements) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom <= activationLine) continue;
        const distance = Math.abs(rect.top - activationLine);
        if (!best || distance < best.distance) {
          best = { id: element.id, distance };
        }
      }

      if (best) {
        setActiveIfChanged(best.id);
        return;
      }

      const lastVisible = [...elements]
        .reverse()
        .find(
          (element) =>
            element.getBoundingClientRect().top < window.innerHeight,
        );
      setActiveIfChanged(
        lastVisible?.id ?? elements[elements.length - 1]?.id ?? null,
      );
    };

    pickActive();

    const chromeOffset =
      chromeMetrics.heightPx + ENCOUNTER_NAV_ACTIVE_OFFSET_PX;
    const observer = new IntersectionObserver(() => pickActive(), {
      root,
      rootMargin: `-${chromeOffset}px 0px -55% 0px`,
      threshold: [0, 0.01, 0.1, 0.25],
    });

    elements.forEach((element) => observer.observe(element));
    window.addEventListener("resize", pickActive);
    root?.addEventListener("scroll", pickActive, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", pickActive);
      root?.removeEventListener("scroll", pickActive);
    };
  }, [
    enabled,
    rootSelector,
    sectionIdKey,
    setActiveIfChanged,
    chromeMetrics.version,
    chromeMetrics.heightPx,
  ]);

  const navigateToSection = useCallback(
    (sectionId: string): boolean => {
      activeRef.current = sectionId;
      setActiveSectionId(sectionId);
      navigatingLockRef.current = true;
      const ok = navigateToEncounterSection(sectionId, { rootSelector });
      window.setTimeout(() => {
        navigatingLockRef.current = false;
      }, 400);
      return ok;
    },
    [rootSelector],
  );

  return { activeSectionId, navigateToSection, chromeMetrics };
}
