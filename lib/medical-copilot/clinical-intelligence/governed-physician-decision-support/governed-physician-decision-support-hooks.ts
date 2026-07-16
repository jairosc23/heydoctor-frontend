"use client";
import { useCallback, useEffect, useState } from "react";
import { governedPhysicianDecisionSupportReadAdapter, type GovernedPhysicianDecisionSupportReadAdapter } from "./governed-physician-decision-support-adapter";
import type { GovernedPhysicianDecisionSupportResult } from "./governed-physician-decision-support";

export type UseGovernedPhysicianDecisionSupportOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPhysicianDecisionSupportReadAdapter };
export type UseGovernedPhysicianDecisionSupportResult = { loading: boolean; error: string | null; result: GovernedPhysicianDecisionSupportResult | null; refresh: () => void };

export function useGovernedPhysicianDecisionSupport(options: UseGovernedPhysicianDecisionSupportOptions): UseGovernedPhysicianDecisionSupportResult {
  const { sessionId, enabled = true, adapter = governedPhysicianDecisionSupportReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianDecisionSupportResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPhysicianDecisionSupport(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
