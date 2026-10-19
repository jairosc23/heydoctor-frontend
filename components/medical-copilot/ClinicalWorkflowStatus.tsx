"use client";

/**
 * CB-1 — ClinicalWorkflowStatus (compact chips).
 */

import { useClinicalWorkflowStatus } from "@/context/ClinicalWorkflowContext";

function statusTone(
  status: string,
): string {
  switch (status) {
    case "completed":
      return "border-emerald-300 bg-emerald-50 text-emerald-800";
    case "error":
      return "border-red-300 bg-red-50 text-red-700";
    case "awaiting_physician":
      return "border-amber-300 bg-amber-50 text-amber-900";
    case "running":
      return "border-sky-300 bg-sky-50 text-sky-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function ClinicalWorkflowStatus() {
  const { status, phase, sessionId, error } = useClinicalWorkflowStatus();

  return (
    <div className="flex flex-col items-end gap-1">
      <span
        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusTone(status)}`}
      >
        {status}
      </span>
      <span className="text-[10px] text-slate-500">{phase}</span>
      {sessionId ? (
        <span className="font-mono text-[10px] text-slate-400">
          {sessionId.slice(0, 12)}…
        </span>
      ) : null}
      {error ? (
        <span className="text-[10px] text-red-600">error recuperable</span>
      ) : null}
    </div>
  );
}
