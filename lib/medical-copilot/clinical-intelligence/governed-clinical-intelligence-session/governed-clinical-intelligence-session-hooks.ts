"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalIntelligenceSessionReadAdapter, type GovernedClinicalIntelligenceSessionReadAdapter } from "./governed-clinical-intelligence-session-adapter";
import type { GovernedClinicalIntelligenceSessionBuilderResult } from "./governed-clinical-intelligence-session";
export type UseGovernedClinicalIntelligenceSessionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalIntelligenceSessionReadAdapter; };
export type UseGovernedClinicalIntelligenceSessionResult = { loading: boolean; error: string | null; result: GovernedClinicalIntelligenceSessionBuilderResult | null; refresh: () => void; };
export function useGovernedClinicalIntelligenceSession(options: UseGovernedClinicalIntelligenceSessionOptions): UseGovernedClinicalIntelligenceSessionResult {
  const { sessionId, enabled = true, adapter = governedClinicalIntelligenceSessionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalIntelligenceSessionBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalIntelligenceSession(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
