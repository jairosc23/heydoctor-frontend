"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface ClinicalSectionSpySection {
  id: string;
}

export interface UseClinicalSectionSpyOptions {
  enabled?: boolean;
  rootSelector?: string;
}

export interface UseClinicalSectionSpyResult {
  activeSectionId: string | null;
  navigateToSection: (sectionId: string) => void;
}

const DEFAULT_ROOT_SELECTOR = "main";
const DEFAULT_CHROME_HEIGHT = 88;
const ACTIVE_OFFSET_PX = 16;

function parseCssPixels(value: string): number | null {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveScrollRoot(rootSelector: string): HTMLElement | null {
  const root = document.querySelector(rootSelector);
  return root instanceof HTMLElement ? root : null;
}

function resolveChromeOffset(): number {
  const workspace = document.querySelector(".clinical-workspace");
  const candidates = [
    workspace instanceof HTMLElement
      ? getComputedStyle(workspace).getPropertyValue("--encounter-chrome-h")
      : "",
    getComputedStyle(document.documentElement).getPropertyValue(
      "--encounter-chrome-h",
    ),
  ];
  for (const value of candidates) {
    const parsed = parseCssPixels(value);
    if (parsed !== null) return parsed;
  }
  return DEFAULT_CHROME_HEIGHT;
}

function isRendered(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

function resolveSectionElement(sectionId: string): HTMLElement | null {
  const candidates = Array.from(
    document.querySelectorAll(`[id="${sectionId}"]`),
  ).filter((element): element is HTMLElement => element instanceof HTMLElement);
  return candidates.find(isRendered) ?? candidates[0] ?? null;
}

function resolveSectionElements(sectionIds: string[]): HTMLElement[] {
  return sectionIds
    .map(resolveSectionElement)
    .filter((element): element is HTMLElement => element instanceof HTMLElement);
}

export function useClinicalSectionSpy(
  sections: ClinicalSectionSpySection[],
  options: UseClinicalSectionSpyOptions = {},
): UseClinicalSectionSpyResult {
  const { enabled = true, rootSelector = DEFAULT_ROOT_SELECTOR } = options;
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    sections[0]?.id ?? null,
  );
  const activeRef = useRef<string | null>(activeSectionId);
  const sectionIdKey = useMemo(
    () => sections.map((section) => section.id).join("|"),
    [sections],
  );

  const setActiveIfChanged = useCallback((sectionId: string | null) => {
    if (activeRef.current === sectionId) return;
    activeRef.current = sectionId;
    setActiveSectionId(sectionId);
  }, []);

  useEffect(() => {
    activeRef.current = activeSectionId;
  }, [activeSectionId]);

  useEffect(() => {
    const sectionIds = sectionIdKey ? sectionIdKey.split("|") : [];
    if (!enabled || typeof window === "undefined" || sectionIds.length === 0) {
      setActiveIfChanged(sectionIds[0] ?? null);
      return;
    }

    const root = resolveScrollRoot(rootSelector);
    const elements = resolveSectionElements(sectionIds);
    if (elements.length === 0) {
      setActiveIfChanged(sectionIds[0] ?? null);
      return;
    }

    const pickActive = () => {
      const chromeOffset = resolveChromeOffset() + ACTIVE_OFFSET_PX;
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
        .find((element) => element.getBoundingClientRect().top < window.innerHeight);
      setActiveIfChanged(lastVisible?.id ?? elements[elements.length - 1]?.id ?? null);
    };

    pickActive();

    const chromeOffset = resolveChromeOffset() + ACTIVE_OFFSET_PX;
    const observer = new IntersectionObserver(
      () => pickActive(),
      {
        root,
        rootMargin: `-${chromeOffset}px 0px -55% 0px`,
        threshold: [0, 0.01, 0.1, 0.25],
      },
    );

    elements.forEach((element) => observer.observe(element));
    window.addEventListener("resize", pickActive);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", pickActive);
    };
  }, [enabled, rootSelector, sectionIdKey, setActiveIfChanged]);

  const navigateToSection = useCallback((sectionId: string) => {
    const element = resolveSectionElement(sectionId);
    if (!element) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setActiveIfChanged(sectionId);

    // Prefer nearest + chrome-aware offset to avoid abrupt jumps (esp. Signature).
    const root = resolveScrollRoot(rootSelector);
    const chromeOffset = resolveChromeOffset() + ACTIVE_OFFSET_PX;
    if (root) {
      const rootRect = root.getBoundingClientRect();
      const elRect = element.getBoundingClientRect();
      const delta = elRect.top - rootRect.top - chromeOffset;
      // Only nudge when the section is meaningfully outside the readable band.
      if (Math.abs(delta) > 8) {
        root.scrollBy({
          top: delta,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    } else {
      element.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    window.setTimeout(() => {
      element.focus({ preventScroll: true });
    }, prefersReducedMotion ? 0 : 180);
  }, [rootSelector, setActiveIfChanged]);

  return { activeSectionId, navigateToSection };
}
