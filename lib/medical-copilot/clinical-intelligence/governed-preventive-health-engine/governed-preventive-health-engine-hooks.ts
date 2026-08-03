"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedPreventiveHealthEngineReadAdapter, type GovernedPreventiveHealthEngineReadAdapter } from "./governed-preventive-health-engine-adapter";
import type { GovernedPreventiveHealthEngineResult } from "./governed-preventive-health-engine";
export type UseGovernedPreventiveHealthEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedPreventiveHealthEngineReadAdapter };
export type UseGovernedPreventiveHealthEngineResult = { loading: boolean; error: string | null; result: GovernedPreventiveHealthEngineResult | null; refresh: () => void };
export function useGovernedPreventiveHealthEngine(options: UseGovernedPreventiveHealthEngineOptions): UseGovernedPreventiveHealthEngineResult {
  const { sessionId, enabled = true, adapter = governedPreventiveHealthEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPreventiveHealthEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPreventiveHealthEngine(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
