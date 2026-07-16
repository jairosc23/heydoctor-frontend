"use client";

import { useEffect, useRef } from "react";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import {
  getMedicalCopilotGovernedClinicalAiOrchestratorPackage,
  getMedicalCopilotGovernedClinicalWorkflowEnginePackage,
} from "@/lib/medical-copilot/api";

/**
 * RC3 package-first: prefetch orchestrator + workflow packages once per session
 * so derived aggregator/workflow panels can project locally (no extra GETs).
 * Silent / non-blocking; does not alter UI.
 */
export function Rc3PackagePrefetch() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const done = useRef<string | null>(null);

  useEffect(() => {
    if (!sessionId || done.current === sessionId) return;
    done.current = sessionId;
    void Promise.allSettled([
      getMedicalCopilotGovernedClinicalAiOrchestratorPackage(sessionId),
      getMedicalCopilotGovernedClinicalWorkflowEnginePackage(sessionId),
    ]);
  }, [sessionId]);

  return null;
}
