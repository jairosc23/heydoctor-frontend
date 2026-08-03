"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedClinicalVisitSummaryDraftReadAdapter,
  type GovernedClinicalVisitSummaryDraftReadAdapter,
} from "./governed-clinical-visit-summary-draft-adapter";
import type { GovernedClinicalVisitSummaryDraftResult } from "./governed-clinical-visit-summary-draft";

export type UseGovernedClinicalVisitSummaryDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedClinicalVisitSummaryDraftReadAdapter;
};

export type UseGovernedClinicalVisitSummaryDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedClinicalVisitSummaryDraftResult | null;
  refresh: () => void;
};

export function useGovernedClinicalVisitSummaryDraft(
  options: UseGovernedClinicalVisitSummaryDraftOptions,
): UseGovernedClinicalVisitSummaryDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedClinicalVisitSummaryDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedClinicalVisitSummaryDraftResult | null>(null);
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
      .getGovernedClinicalVisitSummaryDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
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
