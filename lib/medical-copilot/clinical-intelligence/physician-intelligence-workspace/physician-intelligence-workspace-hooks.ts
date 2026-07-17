"use client";
import { useCallback, useEffect, useState } from "react";
import { physicianIntelligenceWorkspaceReadAdapter, type PhysicianIntelligenceWorkspaceReadAdapter } from "./physician-intelligence-workspace-adapter";
import type { PhysicianIntelligenceWorkspaceBuilderResult } from "./physician-intelligence-workspace";
export type UsePhysicianIntelligenceWorkspaceOptions = { sessionId: string | null | undefined; enabled?: boolean; adapter?: PhysicianIntelligenceWorkspaceReadAdapter; };
export type UsePhysicianIntelligenceWorkspaceResult = { loading: boolean; error: string | null; result: PhysicianIntelligenceWorkspaceBuilderResult | null; refresh: () => void; };
export function usePhysicianIntelligenceWorkspace(options: UsePhysicianIntelligenceWorkspaceOptions): UsePhysicianIntelligenceWorkspaceResult {
  const { sessionId, enabled = true, adapter = physicianIntelligenceWorkspaceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhysicianIntelligenceWorkspaceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getPhysicianIntelligenceWorkspace(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
