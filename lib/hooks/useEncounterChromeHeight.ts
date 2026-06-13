"use client";

import { useEffect, type RefObject } from "react";

/** Phase 4.2.3a — sincroniza --encounter-chrome-h con la altura real del chrome sticky. */
export function useEncounterChromeHeight(
  chromeRef: RefObject<HTMLElement | null>,
  workspaceRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;

    const apply = () => {
      const height = `${chrome.getBoundingClientRect().height}px`;
      chrome.style.setProperty("--encounter-chrome-h", height);
      workspaceRef?.current?.style.setProperty("--encounter-chrome-h", height);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, [chromeRef, workspaceRef]);
}
