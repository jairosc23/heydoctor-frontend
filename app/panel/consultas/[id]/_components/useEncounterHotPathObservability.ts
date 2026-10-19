"use client";

import { useEffect } from "react";
import { clinicalLogger } from "@/lib/clinical-logger";
import {
  ENCOUNTER_HOT_PATH_SLO_SELECTORS,
  createEncounterHotPathSloWatch,
  createEncounterWebVitalsWatch,
  recordEncounterHotPathSample,
  type HotPathSloPhase,
} from "./encounter-hot-path-slo";

function isPhasePresent(phase: HotPathSloPhase): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(
    document.querySelector(ENCOUNTER_HOT_PATH_SLO_SELECTORS[phase]),
  );
}

/**
 * E5-1: measure SOAP / offer / sign carga on the E4 hot path.
 * Async rAF watch — never blocks SOAP render.
 */
export function useEncounterHotPathObservability(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof performance === "undefined") return;
    const watch = createEncounterHotPathSloWatch({
      startedAtMs: performance.now(),
    });
    let raf = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const { done, samples } = watch.observe(
        performance.now(),
        isPhasePresent,
      );
      for (const sample of samples) {
        const evaluation = recordEncounterHotPathSample(
          sample.phase,
          sample.durationMs,
        );
        if (!evaluation.ok) {
          clinicalLogger.warn("encounter-hot-path-slo-breach", {
            phase: evaluation.phase,
            durationMs: evaluation.durationMs,
            budgetMs: evaluation.budgetMs,
            p95Ms: evaluation.p95Ms,
            timedOut: sample.timedOut,
            alertable: evaluation.alertable,
            onHotPath: evaluation.onHotPath,
          });
        }
      }
      if (!done) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    const vitals = createEncounterWebVitalsWatch();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      vitals.disconnect();
    };
  }, [enabled]);
}
