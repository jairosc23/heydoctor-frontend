/**
 * CI-6 — Hook for Clinical Copilot Snapshot (read-only).
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  clinicalCopilotSnapshotReadAdapter,
  type ClinicalCopilotSnapshotReadAdapter,
} from "./snapshot-adapter";
import type { ClinicalCopilotSnapshotResult } from "./snapshot";

export type UseClinicalCopilotSnapshotOptions = {
  sessionId: string | null | undefined;
  enabled?: boolean;
  adapter?: ClinicalCopilotSnapshotReadAdapter;
};

export type UseClinicalCopilotSnapshotResult = {
  loading: boolean;
  error: string | null;
  result: ClinicalCopilotSnapshotResult | null;
  refresh: () => void;
};

export function useClinicalCopilotSnapshot(
  options: UseClinicalCopilotSnapshotOptions,
): UseClinicalCopilotSnapshotResult {
  const {
    sessionId,
    enabled = true,
    adapter = clinicalCopilotSnapshotReadAdapter,
  } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClinicalCopilotSnapshotResult | null>(
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
      .getClinicalCopilotSnapshot(sessionId)
      .then((next) => {
        if (cancelled) return;
        setResult(next);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setResult(null);
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
