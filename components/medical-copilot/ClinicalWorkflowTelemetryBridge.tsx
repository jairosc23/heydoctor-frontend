"use client";

/**
 * CB-2 — Non-invasive telemetry bridge.
 * Observes ClinicalWorkflow state only — does not modify Coordinator/Adapter/Store.
 */

import { useEffect, useRef } from "react";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import {
  createClinicalWorkflowMetricsStore,
  observeClinicalWorkflowTransition,
  type ClinicalWorkflowMetricsSnapshot,
} from "@/lib/medical-copilot/observability";
import type { WorkflowState } from "@/lib/medical-copilot/workflow";

declare global {
  interface Window {
    __HEYDOCTOR_COPILOT_METRICS__?: () => ClinicalWorkflowMetricsSnapshot;
  }
}

export function ClinicalWorkflowTelemetryBridge() {
  const { state } = useClinicalWorkflow();
  const prevRef = useRef<WorkflowState | null>(null);
  const metricsRef = useRef(createClinicalWorkflowMetricsStore());
  const dictationStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__HEYDOCTOR_COPILOT_METRICS__ = () => metricsRef.current.snapshot();
    }
    return () => {
      if (typeof window !== "undefined") {
        delete window.__HEYDOCTOR_COPILOT_METRICS__;
      }
    };
  }, []);

  useEffect(() => {
    const prev = prevRef.current;
    const result = observeClinicalWorkflowTransition(
      prev,
      state,
      metricsRef.current,
      { dictationStartedAtMs: dictationStartedAtRef.current },
    );
    dictationStartedAtRef.current = result.nextDictationStartedAtMs;
    prevRef.current = state;
  }, [state]);

  return null;
}
