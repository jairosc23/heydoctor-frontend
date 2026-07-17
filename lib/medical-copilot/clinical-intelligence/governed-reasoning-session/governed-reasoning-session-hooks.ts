"use client";
import { useCallback, useEffect, useState } from "react";
import { governedReasoningSessionReadAdapter, type GovernedReasoningSessionReadAdapter } from "./governed-reasoning-session-adapter";
import type { GovernedReasoningSessionBuilderResult } from "./governed-reasoning-session";
export type UseGovernedReasoningSessionOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedReasoningSessionReadAdapter; };
export type UseGovernedReasoningSessionResult = { loading: boolean; error: string | null; result: GovernedReasoningSessionBuilderResult | null; refresh: () => void; };
export function useGovernedReasoningSession(options: UseGovernedReasoningSessionOptions): UseGovernedReasoningSessionResult {
  const { sessionId, enabled = true, adapter = governedReasoningSessionReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedReasoningSessionBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedReasoningSession(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
