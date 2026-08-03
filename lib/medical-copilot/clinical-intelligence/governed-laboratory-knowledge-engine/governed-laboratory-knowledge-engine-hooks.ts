"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { governedLaboratoryKnowledgeEngineReadAdapter, type GovernedLaboratoryKnowledgeEngineReadAdapter } from "./governed-laboratory-knowledge-engine-adapter";
import type { GovernedLaboratoryKnowledgeEngineResult } from "./governed-laboratory-knowledge-engine";
export type UseGovernedLaboratoryKnowledgeEngineOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: GovernedLaboratoryKnowledgeEngineReadAdapter };
export type UseGovernedLaboratoryKnowledgeEngineResult = { loading: boolean; error: string | null; result: GovernedLaboratoryKnowledgeEngineResult | null; refresh: () => void };
export function useGovernedLaboratoryKnowledgeEngine(options: UseGovernedLaboratoryKnowledgeEngineOptions): UseGovernedLaboratoryKnowledgeEngineResult {
  const { sessionId, enabled = true, adapter = governedLaboratoryKnowledgeEngineReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedLaboratoryKnowledgeEngineResult | null>(null);
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
