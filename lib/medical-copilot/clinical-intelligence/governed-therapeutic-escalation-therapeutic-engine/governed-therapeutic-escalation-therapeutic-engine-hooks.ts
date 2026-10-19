"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedTherapeuticEscalationTherapeuticEngineReadAdapter, type GovernedTherapeuticEscalationTherapeuticEngineReadAdapter } from "./governed-therapeutic-escalation-therapeutic-engine-adapter";
import type { GovernedTherapeuticEscalationTherapeuticEngineResult } from "./governed-therapeutic-escalation-therapeutic-engine";
export type UseGovernedTherapeuticEscalationTherapeuticEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedTherapeuticEscalationTherapeuticEngineReadAdapter };
export type UseGovernedTherapeuticEscalationTherapeuticEngineResult = { loading: boolean; error: string | null; result: GovernedTherapeuticEscalationTherapeuticEngineResult | null; refresh: () => void };
export function useGovernedTherapeuticEscalationTherapeuticEngine(options: UseGovernedTherapeuticEscalationTherapeuticEngineOptions): UseGovernedTherapeuticEscalationTherapeuticEngineResult {
  const { sessionId, enabled = true, adapter = governedTherapeuticEscalationTherapeuticEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedTherapeuticEscalationTherapeuticEngineResult | null>(null);
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
