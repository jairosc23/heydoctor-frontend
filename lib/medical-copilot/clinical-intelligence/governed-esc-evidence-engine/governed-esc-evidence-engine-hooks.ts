"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEscEvidenceEngineReadAdapter, type GovernedEscEvidenceEngineReadAdapter } from "./governed-esc-evidence-engine-adapter";
import type { GovernedEscEvidenceEngineResult } from "./governed-esc-evidence-engine";
export type UseGovernedEscEvidenceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEscEvidenceEngineReadAdapter };
export type UseGovernedEscEvidenceEngineResult = { loading: boolean; error: string | null; result: GovernedEscEvidenceEngineResult | null; refresh: () => void };
export function useGovernedEscEvidenceEngine(options: UseGovernedEscEvidenceEngineOptions): UseGovernedEscEvidenceEngineResult {
  const { sessionId, enabled = true, adapter = governedEscEvidenceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEscEvidenceEngineResult | null>(null);
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
