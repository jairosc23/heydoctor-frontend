"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedWhoEvidenceEngineReadAdapter, type GovernedWhoEvidenceEngineReadAdapter } from "./governed-who-evidence-engine-adapter";
import type { GovernedWhoEvidenceEngineResult } from "./governed-who-evidence-engine";
export type UseGovernedWhoEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedWhoEvidenceEngineReadAdapter };
export type UseGovernedWhoEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedWhoEvidenceEngineResult | null; refresh: () => void };
export function useGovernedWhoEvidenceEngine(options: UseGovernedWhoEvidenceEngineOptions): UseGovernedWhoEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedWhoEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedWhoEvidenceEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
