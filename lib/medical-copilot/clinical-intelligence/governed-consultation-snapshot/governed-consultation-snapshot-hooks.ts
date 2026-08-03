"use client";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { useCallback, useEffect, useState } from "react";
import {
  governedConsultationSnapshotReadAdapter,
  type GovernedConsultationSnapshotReadAdapter,
} from "./governed-consultation-snapshot-adapter";
import type { GovernedConsultationSnapshotResult } from "./governed-consultation-snapshot";

export type UseGovernedConsultationSnapshotOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: GovernedConsultationSnapshotReadAdapter;
};

export type UseGovernedConsultationSnapshotResult = {
  loading: boolean;
  error: string | null;
  result: GovernedConsultationSnapshotResult | null;
  refresh: () => void;
};

export function useGovernedConsultationSnapshot(
  options: UseGovernedConsultationSnapshotOptions,
): UseGovernedConsultationSnapshotResult {
  const {
    sessionId,
    enabled = true,
    adapter = governedConsultationSnapshotReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GovernedConsultationSnapshotResult | null>(null);
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
      .getGovernedConsultationSnapshot(sessionId)
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
