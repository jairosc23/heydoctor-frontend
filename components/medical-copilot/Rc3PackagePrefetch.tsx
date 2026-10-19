"use client";

import { useEffect, useRef } from "react";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
import {
  getMedicalCopilotGovernedClinicalAiOrchestratorPackage,
  getMedicalCopilotGovernedClinicalWorkflowEnginePackage,
} from "@/lib/medical-copilot/api";
import { recordRc4PackageHydration } from "@/lib/medical-copilot/rc4-operational";

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
    const started = typeof performance !== "undefined" ? performance.now() : Date.now();
    void Promise.allSettled([
      getMedicalCopilotGovernedClinicalAiOrchestratorPackage(sessionId),
      getMedicalCopilotGovernedClinicalWorkflowEnginePackage(sessionId),
    ]).then(() => {
      const end = typeof performance !== "undefined" ? performance.now() : Date.now();
      recordRc4PackageHydration("orchestrator+workflow", end - started);
    });
  }, [sessionId]);

  return null;
}
