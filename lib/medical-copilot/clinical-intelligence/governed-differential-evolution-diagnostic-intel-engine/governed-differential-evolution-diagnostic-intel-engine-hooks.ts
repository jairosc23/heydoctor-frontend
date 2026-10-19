"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDifferentialEvolutionDiagnosticIntelEngineReadAdapter, type GovernedDifferentialEvolutionDiagnosticIntelEngineReadAdapter } from "./governed-differential-evolution-diagnostic-intel-engine-adapter";
import type { GovernedDifferentialEvolutionDiagnosticIntelEngineResult } from "./governed-differential-evolution-diagnostic-intel-engine";
export type UseGovernedDifferentialEvolutionDiagnosticIntelEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDifferentialEvolutionDiagnosticIntelEngineReadAdapter };
export type UseGovernedDifferentialEvolutionDiagnosticIntelEngineResult = { loading: boolean; error: string | null; result: GovernedDifferentialEvolutionDiagnosticIntelEngineResult | null; refresh: () => void };
export function useGovernedDifferentialEvolutionDiagnosticIntelEngine(options: UseGovernedDifferentialEvolutionDiagnosticIntelEngineOptions): UseGovernedDifferentialEvolutionDiagnosticIntelEngineResult {
  const { sessionId, enabled = true, adapter = governedDifferentialEvolutionDiagnosticIntelEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDifferentialEvolutionDiagnosticIntelEngineResult | null>(null);
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
