"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalReasoningSessionReadAdapter, type GovernedClinicalReasoningSessionReadAdapter } from "./governed-clinical-reasoning-session-adapter";
import type { GovernedClinicalReasoningSessionBuilderResult } from "./governed-clinical-reasoning-session";
export type UseGovernedClinicalReasoningSessionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalReasoningSessionReadAdapter; };
export type UseGovernedClinicalReasoningSessionResult = { loading: boolean; error: string | null; result: GovernedClinicalReasoningSessionBuilderResult | null; refresh: () => void; };
export function useGovernedClinicalReasoningSession(options: UseGovernedClinicalReasoningSessionOptions): UseGovernedClinicalReasoningSessionResult {
  const { sessionId, enabled = true, adapter = governedClinicalReasoningSessionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalReasoningSessionBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedClinicalReasoningSession(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
