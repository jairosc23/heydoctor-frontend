"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedEvidenceSourceEngineReadAdapter, type GovernedEvidenceSourceEngineReadAdapter } from "./governed-evidence-source-engine-adapter";
import type { GovernedEvidenceSourceEngineResult } from "./governed-evidence-source-engine";
export type UseGovernedEvidenceSourceEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEvidenceSourceEngineReadAdapter };
export type UseGovernedEvidenceSourceEngineResult = { loading: boolean; error: string | null; result: GovernedEvidenceSourceEngineResult | null; refresh: () => void };
export function useGovernedEvidenceSourceEngine(options: UseGovernedEvidenceSourceEngineOptions): UseGovernedEvidenceSourceEngineResult {
  const { sessionId, enabled = true, adapter = governedEvidenceSourceEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEvidenceSourceEngineResult | null>(null);
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
