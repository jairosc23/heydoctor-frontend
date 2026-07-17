"use client";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalKnowledgePackageReadAdapter, type GovernedClinicalKnowledgePackageReadAdapter } from "./governed-clinical-knowledge-package-adapter";
import type { GovernedClinicalKnowledgePackageResult } from "./governed-clinical-knowledge-package";
export type UseGovernedClinicalKnowledgePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalKnowledgePackageReadAdapter };
export type UseGovernedClinicalKnowledgePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalKnowledgePackageResult | null; refresh: () => void };
export function useGovernedClinicalKnowledgePackage(options: UseGovernedClinicalKnowledgePackageOptions): UseGovernedClinicalKnowledgePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalKnowledgePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalKnowledgePackageResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.get(sessionId)
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
