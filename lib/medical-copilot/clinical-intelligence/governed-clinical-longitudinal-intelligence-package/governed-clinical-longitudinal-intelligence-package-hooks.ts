"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedClinicalLongitudinalIntelligencePackageReadAdapter, type GovernedClinicalLongitudinalIntelligencePackageReadAdapter } from "./governed-clinical-longitudinal-intelligence-package-adapter";
import type { GovernedClinicalLongitudinalIntelligencePackageResult } from "./governed-clinical-longitudinal-intelligence-package";
export type UseGovernedClinicalLongitudinalIntelligencePackageOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedClinicalLongitudinalIntelligencePackageReadAdapter };
export type UseGovernedClinicalLongitudinalIntelligencePackageResult = { loading: boolean; error: string | null; result: GovernedClinicalLongitudinalIntelligencePackageResult | null; refresh: () => void };
export function useGovernedClinicalLongitudinalIntelligencePackage(options: UseGovernedClinicalLongitudinalIntelligencePackageOptions): UseGovernedClinicalLongitudinalIntelligencePackageResult {
  const { sessionId, enabled = true, adapter = governedClinicalLongitudinalIntelligencePackageReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedClinicalLongitudinalIntelligencePackageResult | null>(null);
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
