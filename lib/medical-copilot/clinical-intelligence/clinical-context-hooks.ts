/**
 * CI-9 — Hook for Clinical Context (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalContextReadAdapter,
  type ClinicalContextReadAdapter,
} from "./clinical-context-adapter";
import type { ClinicalContextResult } from "./clinical-context";

export type UseClinicalContextOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalContextReadAdapter;
};

export type UseClinicalContextResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalContextResult | null;
  refresh: () => void;
};

export function useClinicalContext(
  options: UseClinicalContextOptions,
): UseClinicalContextResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalContextReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalContextResult | null>(null);
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
      .getClinicalContext(sessionId)
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
