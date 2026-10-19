"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedSoapDraftReadAdapter,
  type GovernedSoapDraftReadAdapter,
} from "./governed-soap-draft-adapter";
import type { GovernedSoapDraftResult } from "./governed-soap-draft";

export type UseGovernedSoapDraftOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedSoapDraftReadAdapter;
};

export type UseGovernedSoapDraftResult = {
  loading: boolean;
  error: string | null;
  result: GovernedSoapDraftResult | null;
  refresh: () => void;
};

export function useGovernedSoapDraft(
  options: UseGovernedSoapDraftOptions,
): UseGovernedSoapDraftResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedSoapDraftReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedSoapDraftResult | null>(null);
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
      .getGovernedSoapDraft(sessionId)
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
