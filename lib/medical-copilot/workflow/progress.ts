/**
 * CB-1 — Workflow progress derivation.
 */

import {
  WORKFLOW_STEP_LABELS,
  type ClinicalWorkflowPhase,
  type WorkflowProgress,
  type WorkflowProgressStep,
  type WorkflowProgressStepId,
} from "./types";

const ORDER: WorkflowProgressStepId[] = [
  "consultation",
  "bootstrap",
  "workspace",
  "dictation",
  "voice_intelligence",
  "governed_analysis",
  "hitl",
  "complete",
];

function currentStepForPhase(
  phase: ClinicalWorkflowPhase,
): WorkflowProgressStepId | null {
  switch (phase) {
    case "idle":
      return null;
    case "entering_consultation":
      return "consultation";
    case "bootstrapping":
      return "bootstrap";
    case "workspace_ready":
      return "workspace";
    case "dictation_ready":
      return "dictation";
    case "voice_intelligence_active":
      return "voice_intelligence";
    case "governed_analysis":
      return "governed_analysis";
    case "hitl_review":
      return "hitl";
    case "consultation_complete":
      return "complete";
    case "recoverable_error":
      return "bootstrap";
    default:
      return null;
  }
}

function indexOf(step: WorkflowProgressStepId | null): number {
  if (!step) return -1;
  return ORDER.indexOf(step);
}

export function buildWorkflowProgress(
  phase: ClinicalWorkflowPhase,
  opts?: { error?: boolean },
): WorkflowProgress {
  const current = currentStepForPhase(phase);
  const currentIdx = indexOf(current);
  const doneThrough =
    phase === "consultation_complete"
      ? ORDER.length - 1
      : Math.max(currentIdx - 1, -1);

  const steps: WorkflowProgressStep[] = ORDER.map((id, idx) => {
    let state: WorkflowProgressStep["state"] = "pending";
    if (opts?.error && id === current) state = "error";
    else if (phase === "consultation_complete" || idx <= doneThrough)
      state = "done";
    else if (id === current) state = "current";
    return { id, label: WORKFLOW_STEP_LABELS[id], state };
  });

  const doneCount = steps.filter((s) => s.state === "done").length;
  const percent =
    phase === "consultation_complete"
      ? 100
      : Math.round((doneCount / ORDER.length) * 100);

  return {
    percent,
    currentStepId: current,
    steps,
  };
}
