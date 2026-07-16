"use client";
import { useCallback, useEffect, useState } from "react";
import {
  governedFollowUpDraftReadAdapter,
  type GovernedFollowUpDraftReadAdapter,
} from "./governed-follow-up-draft-adapter";
import type { GovernedFollowUpDraftResult } from "./governed-follow-up-draft";

export type UseGovernedFollowUpDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedFollowUpDraftReadAdapter;
};

export type UseGovernedFollowUpDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedFollowUpDraftResult | null;
  refresh: () => void;
};

export function useGovernedFollowUpDraft(
  options: UseGovernedFollowUpDraftOptions,
): UseGovernedFollowUpDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedFollowUpDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedFollowUpDraftResult | null>(
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
      .getGovernedFollowUpDraft(sessionId)
      .then((next) => {
        if (!cancelled) setResult(next);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
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
