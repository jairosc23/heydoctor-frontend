"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter, type GovernedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter } from "./governed-rare-disease-awareness-diagnostic-intel-engine-adapter";
import type { GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult } from "./governed-rare-disease-awareness-diagnostic-intel-engine";
export type UseGovernedRareDiseaseAwarenessDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter };
export type UseGovernedRareDiseaseAwarenessDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedRareDiseaseAwarenessDiagnosticIntelEngine(options: UseGovernedRareDiseaseAwarenessDiagnosticIntelEngineOptions): UseGovernedRareDiseaseAwarenessDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedRareDiseaseAwarenessDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedRareDiseaseAwarenessDiagnosticIntelEngineResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
