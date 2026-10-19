"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedDischargeDraftReadAdapter,
  type GovernedDischargeDraftReadAdapter,
} from "./governed-discharge-draft-adapter";
import type { GovernedDischargeDraftResult } from "./governed-discharge-draft";

export type UseGovernedDischargeDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedDischargeDraftReadAdapter;
};

export type UseGovernedDischargeDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedDischargeDraftResult | null;
  refresh: () => void;
};

export function useGovernedDischargeDraft(
  options: UseGovernedDischargeDraftOptions,
): UseGovernedDischargeDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedDischargeDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedDischargeDraftResult | null>(
    null,
  );
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled || !sessionId) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void adapter
      .getGovernedDischargeDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(toAiClinicalUserMessage(err));
          setResult(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [adapter, enabled, sessionId, tick]);

  return { loading, error, result, refresh };
}
