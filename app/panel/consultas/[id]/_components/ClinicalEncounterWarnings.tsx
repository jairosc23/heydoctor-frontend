"use client";

import { cn } from "@/lib/utils";
import type { ClinicalEncounterSignal } from "./clinical-encounter-intelligence-model";

function severityClass(severity: ClinicalEncounterSignal["severity"]) {
  if (severity === "critical") {
    return "border-red-200 bg-red-50 text-red-900";
  }
  if (severity === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-blue-200 bg-blue-50 text-blue-900";
}

function severityLabel(severity: ClinicalEncounterSignal["severity"]) {
  if (severity === "critical") return "Crítico";
  if (severity === "warning") return "Atención";
  return "Info";
}

export function ClinicalEncounterWarnings({
  signals,
  compact = false,
}: {
  signals: ClinicalEncounterSignal[];
  compact?: boolean;
}) {
  if (signals.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-1" : "md:grid-cols-2 xl:grid-cols-3",
      )}
      data-testid="clinical-encounter-warnings"
    >
      {signals.map((signal) => (
        <article
          key={signal.id}
          className={cn(
            "min-w-0 rounded-hd-md border px-3 py-2 text-xs",
            severityClass(signal.severity),
          )}
          data-severity={signal.severity}
          data-signal-kind={signal.kind}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="truncate font-semibold">{signal.title}</p>
            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold">
              {severityLabel(signal.severity)}
            </span>
          </div>
          <p className="line-clamp-2 leading-snug opacity-90">{signal.detail}</p>
        </article>
      ))}
    </div>
  );
}
