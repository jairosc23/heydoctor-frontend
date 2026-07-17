"use client";
import { useCallback, useEffect, useState } from "react";
import { governedAllergyCrossCheckReadAdapter, type GovernedAllergyCrossCheckReadAdapter } from "./governed-allergy-cross-check-adapter";
import type { GovernedAllergyCrossCheckResult } from "./governed-allergy-cross-check";

export type UseGovernedAllergyCrossCheckOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedAllergyCrossCheckReadAdapter };
export type UseGovernedAllergyCrossCheckResult = { loading: boolean; error: string | null; result: GovernedAllergyCrossCheckResult | null; refresh: () => void };

export function useGovernedAllergyCrossCheck(options: UseGovernedAllergyCrossCheckOptions): UseGovernedAllergyCrossCheckResult {
  const { sessionId, enabled = true, adapter = governedAllergyCrossCheckReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedAllergyCrossCheckResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedAllergyCrossCheck(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
