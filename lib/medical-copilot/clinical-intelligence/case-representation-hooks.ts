/**
 * CI-8 — Hook for Clinical Case Representation (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalCaseRepresentationReadAdapter,
  type ClinicalCaseRepresentationReadAdapter,
} from "./case-representation-adapter";
import type { ClinicalCaseRepresentationResult } from "./case-representation";

export type UseClinicalCaseRepresentationOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalCaseRepresentationReadAdapter;
};

export type UseClinicalCaseRepresentationResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalCaseRepresentationResult | null;
  refresh: () => void;
};

export function useClinicalCaseRepresentation(
  options: UseClinicalCaseRepresentationOptions,
): UseClinicalCaseRepresentationResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalCaseRepresentationReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<ClinicalCaseRepresentationResult | null>(null);
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
      .getClinicalCaseRepresentation(sessionId)
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
