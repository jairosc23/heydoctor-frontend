"use client";
import { useCallback, useEffect, useState } from "react";
import { governedReasoningPreparationReadAdapter, type GovernedReasoningPreparationReadAdapter } from "./governed-reasoning-preparation-adapter";
import type { GovernedReasoningPreparationBuilderResult } from "./governed-reasoning-preparation";
export type UseGovernedReasoningPreparationOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReasoningPreparationReadAdapter; };
export type UseGovernedReasoningPreparationResult = { loading: boolean; error: string | null; result: GovernedReasoningPreparationBuilderResult | null; refresh: () => void; };
export function useGovernedReasoningPreparation(options: UseGovernedReasoningPreparationOptions): UseGovernedReasoningPreparationResult {
  const { sessionId, enabled = true, adapter = governedReasoningPreparationReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReasoningPreparationBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReasoningPreparation(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
