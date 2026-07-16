"use client";
import { useCallback, useEffect, useState } from "react";
import { governedEmergencyMedicineKnowledgeEngineReadAdapter, type GovernedEmergencyMedicineKnowledgeEngineReadAdapter } from "./governed-emergency-medicine-knowledge-engine-adapter";
import type { GovernedEmergencyMedicineKnowledgeEngineResult } from "./governed-emergency-medicine-knowledge-engine";
export type UseGovernedEmergencyMedicineKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedEmergencyMedicineKnowledgeEngineReadAdapter };
export type UseGovernedEmergencyMedicineKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedEmergencyMedicineKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedEmergencyMedicineKnowledgeEngine(options: UseGovernedEmergencyMedicineKnowledgeEngineOptions): UseGovernedEmergencyMedicineKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedEmergencyMedicineKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedEmergencyMedicineKnowledgeEngineResult | null>(null);
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
