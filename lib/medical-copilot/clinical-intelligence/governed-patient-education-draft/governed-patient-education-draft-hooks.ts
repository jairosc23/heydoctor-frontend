"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedPatientEducationDraftReadAdapter,
  type GovernedPatientEducationDraftReadAdapter,
} from "./governed-patient-education-draft-adapter";
import type { GovernedPatientEducationDraftResult } from "./governed-patient-education-draft";

export type UseGovernedPatientEducationDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPatientEducationDraftReadAdapter;
};

export type UseGovernedPatientEducationDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPatientEducationDraftResult | null;
  refresh: () => void;
};

export function useGovernedPatientEducationDraft(
  options: UseGovernedPatientEducationDraftOptions,
): UseGovernedPatientEducationDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedPatientEducationDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedPatientEducationDraftResult | null>(null);
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
      .getGovernedPatientEducationDraft(sessionId)
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
