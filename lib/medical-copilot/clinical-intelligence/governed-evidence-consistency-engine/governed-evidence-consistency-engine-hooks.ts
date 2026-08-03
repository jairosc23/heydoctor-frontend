"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceConsistencyEngineReadAdapter, type GovernedEvidenceConsistencyEngineReadAdapter } from "./governed-evidence-consistency-engine-adapter";
import type { GovernedEvidenceConsistencyEngineResult } from "./governed-evidence-consistency-engine";
export type UseGovernedEvidenceConsistencyEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceConsistencyEngineReadAdapter };
export type UseGovernedEvidenceConsistencyEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceConsistencyEngineResult | null; refresh: () => void };
export function useGovernedEvidenceConsistencyEngine(options: UseGovernedEvidenceConsistencyEngineOptions): UseGovernedEvidenceConsistencyEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceConsistencyEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceConsistencyEngineResult | null>(null);
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
