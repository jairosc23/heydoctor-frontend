"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPrescriptionDraftReadAdapter,
  type GovernedPrescriptionDraftReadAdapter,
} from "./governed-prescription-draft-adapter";
import type { GovernedPrescriptionDraftResult } from "./governed-prescription-draft";

export type UseGovernedPrescriptionDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPrescriptionDraftReadAdapter;
};

export type UseGovernedPrescriptionDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPrescriptionDraftResult | null;
  refresh: () => void;
};

export function useGovernedPrescriptionDraft(
  options: UseGovernedPrescriptionDraftOptions,
): UseGovernedPrescriptionDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPrescriptionDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedPrescriptionDraftResult | null>(null);
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
      .getGovernedPrescriptionDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setResult(null);
        }
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
