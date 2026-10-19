"use client";

import { useEffect } from "react";
import { clinicalLogger } from "@/lib/clinical-logger";
import { ingestCipResourceEntries } from "./encounter-hot-path-slo";

/**
 * E5-2: CIP / Knowledge / Spine resource hops. Mounted only with disclosure
 * (lazy). PerformanceObserver is async; SOAP is never awaited.
 */
export function EncounterCipHopTracer(): null {
  useEffect(() => {
    if (typeof PerformanceObserver === "undefined") return undefined;

    let cancelled = false;
    let observer: PerformanceObserver | null = null;

    const ingest = (list: PerformanceObserverEntryList) => {
      if (cancelled) return;
      const recorded = ingestCipResourceEntries(
        list.getEntries().map((entry) => ({
          name: entry.name,
          duration: entry.duration,
        })),
      );
      for (const hop of recorded) {
        clinicalLogger.event("encounter-cip-hop", {
          hop: hop.hop,
          durationMs: hop.durationMs,
          onHotPath: hop.onHotPath,
          alertable: hop.alertable,
        });
      }
    };

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        observer = new PerformanceObserver(ingest);
        observer.observe({ type: "resource", buffered: true });
      } catch {
        observer = null;
      }
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
