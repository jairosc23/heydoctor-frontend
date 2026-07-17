/**
 * CI-5 — Hook for Governed Clinical Reasoning (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalReasoningReadAdapter,
  type ClinicalReasoningReadAdapter,
} from "./reasoning-adapter";
import type { ClinicalReasoningResult } from "./reasoning";

export type UseClinicalReasoningOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalReasoningReadAdapter;
};

export type UseClinicalReasoningResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalReasoningResult | null;
  refresh: () => void;
};

export function useClinicalReasoning(
  options: UseClinicalReasoningOptions,
): UseClinicalReasoningResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalReasoningReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalReasoningResult | null>(null);
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
      .getGovernedClinicalReasoning(sessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
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
