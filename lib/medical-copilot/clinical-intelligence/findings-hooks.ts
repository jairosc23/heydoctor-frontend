/**
 * CI-1 — Hook for Clinical Findings (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  clinicalFindingsReadAdapter,
  type ClinicalFindingsReadAdapter,
} from "./findings-adapter";
import type { ClinicalIntelligenceResult } from "./findings";

export type UseClinicalFindingsOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalFindingsReadAdapter;
};

export type UseClinicalFindingsResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalIntelligenceResult | null;
  refresh: () => void;
};

export function useClinicalFindings(
  options: UseClinicalFindingsOptions,
): UseClinicalFindingsResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalFindingsReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalIntelligenceResult | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getClinicalIntelligence(sessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(toAiClinicalUserMessage(err));
        setResult(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
