"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedReferralPersistenceExecutionReadAdapter, type GovernedReferralPersistenceExecutionReadAdapter } from "./governed-referral-persistence-execution-adapter";
import type { GovernedReferralPersistenceExecutionResult } from "./governed-referral-persistence-execution";
export type UseGovernedReferralPersistenceExecutionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReferralPersistenceExecutionReadAdapter };
export type UseGovernedReferralPersistenceExecutionResult = { loading: boolean; error: string | null; result: GovernedReferralPersistenceExecutionResult | null; refresh: () => void };
export function useGovernedReferralPersistenceExecution(options: UseGovernedReferralPersistenceExecutionOptions): UseGovernedReferralPersistenceExecutionResult {
  const { sessionId, enabled = true, adapter = governedReferralPersistenceExecutionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReferralPersistenceExecutionResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReferralPersistenceExecution(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
