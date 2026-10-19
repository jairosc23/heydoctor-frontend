/**
 * CI-4 — Hook for Clinical Decision Support (read-only).
 */

"use client";

import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  clinicalDecisionSupportReadAdapter,
  type ClinicalDecisionSupportReadAdapter,
} from "./decisions-adapter";
import type { ClinicalDecisionResult } from "./decisions";

export type UseClinicalDecisionSupportOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalDecisionSupportReadAdapter;
};

export type UseClinicalDecisionSupportResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalDecisionResult | null;
  refresh: () => void;
};

export function useClinicalDecisionSupport(
  options: UseClinicalDecisionSupportOptions,
): UseClinicalDecisionSupportResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalDecisionSupportReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalDecisionResult | null>(null);
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
      .getClinicalDecisionSupport(sessionId)
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
