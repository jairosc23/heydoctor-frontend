"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalAiOrchestratorPackageReadAdapter, type GovernedClinicalAiOrchestratorPackageReadAdapter } from "./governed-clinical-ai-orchestrator-package-adapter";
import type { GovernedClinicalAiOrchestratorPackageResult } from "./governed-clinical-ai-orchestrator-package";
export type UseGovernedClinicalAiOrchestratorPackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalAiOrchestratorPackageReadAdapter };
export type UseGovernedClinicalAiOrchestratorPackageResult = { loading: boolean; error: string | null; result: GovernedClinicalAiOrchestratorPackageResult | null; refresh: () => void };
export function useGovernedClinicalAiOrchestratorPackage(options: UseGovernedClinicalAiOrchestratorPackageOptions): UseGovernedClinicalAiOrchestratorPackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalAiOrchestratorPackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalAiOrchestratorPackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false; setLoading(true); setError(null);
    void adapter.get(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
