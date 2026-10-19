"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedReferralDraftReadAdapter,
  type GovernedReferralDraftReadAdapter,
} from "./governed-referral-draft-adapter";
import type { GovernedReferralDraftResult } from "./governed-referral-draft";

export type UseGovernedReferralDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedReferralDraftReadAdapter;
};

export type UseGovernedReferralDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedReferralDraftResult | null;
  refresh: () => void;
};

export function useGovernedReferralDraft(
  options: UseGovernedReferralDraftOptions,
): UseGovernedReferralDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedReferralDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReferralDraftResult | null>(null);
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
      .getGovernedReferralDraft(sessionId)
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
