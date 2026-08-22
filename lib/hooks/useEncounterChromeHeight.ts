"use client";

import { useEffect, type RefObject } from "react";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import { publishEncounterChromeHeight } from "@/lib/encounter/navigation/chrome-metrics";

/** Measure chrome; Kernel/Foundation is the only CSS publisher. */
export function useEncounterChromeHeight(
  chromeRef: RefObject<HTMLElement | null>,
  workspaceRef?: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const chrome = chromeRef.current;
    if (!chrome) return;

    const apply = () => {
      publishEncounterChromeHeight(
        clinicalWorkspaceKernel.measureChrome(chrome),
      );
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(chrome);
    return () => observer.disconnect();
  }, [chromeRef, workspaceRef]);
}
