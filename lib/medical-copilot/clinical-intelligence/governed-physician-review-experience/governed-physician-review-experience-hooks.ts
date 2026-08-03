"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import { reviewExperienceReadAdapter, type GovernedPhysicianReviewExperienceReadAdapter } from "./governed-physician-review-experience-adapter";
import type { GovernedPhysicianReviewExperienceBuilderResult } from "./governed-physician-review-experience";

export type UseGovernedPhysicianReviewExperienceOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedPhysicianReviewExperienceReadAdapter;
};
export type UseGovernedPhysicianReviewExperienceResult = {
  loading: boolean;
  error: string | null;
  result: GovernedPhysicianReviewExperienceBuilderResult | null;
  refresh: () => void;
};

export function useGovernedPhysicianReviewExperience(options: UseGovernedPhysicianReviewExperienceOptions): UseGovernedPhysicianReviewExperienceResult {
  const { sessionId, enabled = true, adapter = reviewExperienceReadAdapter } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedPhysicianReviewExperienceBuilderResult | null>(null);
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);
  useEffect(() => {
    if (!enabled || !sessionId) { setResult(null); setError(null); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    void adapter.getGovernedPhysicianReviewExperience(sessionId).then((next) => { if (!cancelled) setResult(next); })
      .catch((err) => { if (!cancelled) { setError(toAiClinicalUserMessage(err)); setResult(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [adapter, enabled, sessionId, tick]);
  return { loading, error, result, refresh };
}
