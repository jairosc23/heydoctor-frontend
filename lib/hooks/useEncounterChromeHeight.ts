"use client";

import { useEffect, type RefObject } from "react";
import { publishEncounterChromeHeight } from "@/lib/encounter/navigation/chrome-metrics";

/** Sync sticky chrome height → CSS vars + Navigation SSOT metrics (live). */
export function useEncounterChromeHeight(
  chromeRef: RefObject<HTMLElement | null>,
  workspaceRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;

    const apply = () => {
      const heightPx = chrome.getBoundingClientRect().height;
      const height = `${heightPx}px`;
      chrome.style.setProperty("--encounter-chrome-h", height);
      workspaceRef?.current?.style.setProperty("--encounter-chrome-h", height);
      publishEncounterChromeHeight(heightPx);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, [chromeRef, workspaceRef]);
}
