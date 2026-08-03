"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationPersistenceBridgeReadAdapter,
  type GovernedConsultationPersistenceBridgeReadAdapter,
} from "./governed-consultation-persistence-bridge-adapter";
import type { GovernedConsultationPersistenceBridgeResult } from "./governed-consultation-persistence-bridge";

export type UseGovernedConsultationPersistenceBridgeOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationPersistenceBridgeReadAdapter;
};

export type UseGovernedConsultationPersistenceBridgeResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationPersistenceBridgeResult | null;
  refresh: () => void;
};

export function useGovernedConsultationPersistenceBridge(
  options: UseGovernedConsultationPersistenceBridgeOptions,
): UseGovernedConsultationPersistenceBridgeResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationPersistenceBridgeReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] =
    useState<GovernedConsultationPersistenceBridgeResult | null>(null);
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
      .getGovernedConsultationPersistenceBridge(sessionId)
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
