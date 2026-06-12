"use client";

import {
  COPILOT_CONTEXT_SOURCE_LABELS,
  type CopilotContextSource,
} from "@/lib/clinical-copilot-mock";

export function CopilotSourceStrip({ sources }: { sources: CopilotContextSource[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {sources.map((source) => {
        const meta = COPILOT_CONTEXT_SOURCE_LABELS[source];
        return (
          <span
            key={source}
            className="clinical-chip inline-flex items-center gap-1 rounded-full border border-hd-border-subtle bg-hd-surface-raised px-2 py-0.5 text-[10px] font-medium text-slate-600"
          >
            <span aria-hidden>{meta.icon}</span>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}
