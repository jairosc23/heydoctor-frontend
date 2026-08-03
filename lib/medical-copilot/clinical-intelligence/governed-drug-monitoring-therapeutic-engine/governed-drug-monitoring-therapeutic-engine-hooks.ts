"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedDrugMonitoringTherapeuticEngineReadAdapter, type GovernedDrugMonitoringTherapeuticEngineReadAdapter } from "./governed-drug-monitoring-therapeutic-engine-adapter";
import type { GovernedDrugMonitoringTherapeuticEngineResult } from "./governed-drug-monitoring-therapeutic-engine";
export type UseGovernedDrugMonitoringTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedDrugMonitoringTherapeuticEngineReadAdapter };
export type UseGovernedDrugMonitoringTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedDrugMonitoringTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedDrugMonitoringTherapeuticEngine(options: UseGovernedDrugMonitoringTherapeuticEngineOptions): UseGovernedDrugMonitoringTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedDrugMonitoringTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDrugMonitoringTherapeuticEngineResult | null>(null);
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
