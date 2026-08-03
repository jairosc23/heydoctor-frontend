"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalSafetyChecksReadAdapter, type GovernedClinicalSafetyChecksReadAdapter } from "./governed-clinical-safety-checks-adapter";
import type { GovernedClinicalSafetyChecksResult } from "./governed-clinical-safety-checks";

export type UseGovernedClinicalSafetyChecksOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalSafetyChecksReadAdapter };
export type UseGovernedClinicalSafetyChecksResult = { loading: boolean; error: string | null; result: GovernedClinicalSafetyChecksResult | null; refresh: () => void };

export function useGovernedClinicalSafetyChecks(options: UseGovernedClinicalSafetyChecksOptions): UseGovernedClinicalSafetyChecksResult {
  const { sessionId, enabled = true, adapter = governedClinicalSafetyChecksReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalSafetyChecksResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalSafetyChecks(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
