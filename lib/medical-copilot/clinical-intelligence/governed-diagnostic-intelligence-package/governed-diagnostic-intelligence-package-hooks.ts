"use client";
import { useCallback, useEffect, useState } from "react";
import { governedDiagnosticIntelligencePackageReadAdapter, type GovernedDiagnosticIntelligencePackageReadAdapter } from "./governed-diagnostic-intelligence-package-adapter";
import type { GovernedDiagnosticIntelligencePackageResult } from "./governed-diagnostic-intelligence-package";
export type UseGovernedDiagnosticIntelligencePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDiagnosticIntelligencePackageReadAdapter };
export type UseGovernedDiagnosticIntelligencePackageResult = { loading: boolean; error: string | null; result: GovernedDiagnosticIntelligencePackageResult | null; refresh: () => void };
export function useGovernedDiagnosticIntelligencePackage(options: UseGovernedDiagnosticIntelligencePackageOptions): UseGovernedDiagnosticIntelligencePackageResult {
  const { sessionId, enabled = true, adapter = governedDiagnosticIntelligencePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDiagnosticIntelligencePackageResult | null>(null);
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
