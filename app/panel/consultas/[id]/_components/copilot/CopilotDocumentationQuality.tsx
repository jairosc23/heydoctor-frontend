"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  getQualityLabelStyles,
  type DocumentationQuality,
} from "@/lib/clinical-copilot-intelligence";

export function CopilotDocumentationQuality({
  quality,
}: {
  quality: DocumentationQuality;
}) {
  return (
    <section aria-label="Documentation Quality" className="space-y-hd-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className={CLINICAL_SECTION_TITLE}>Documentation Quality™</h3>
          <p className="text-[11px] text-slate-500">
            Puntuación informativa — no obligatoria
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase ${getQualityLabelStyles(quality.label)}`}
        >
          {quality.label}
        </span>
      </div>

      <div className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums text-slate-900">
            {quality.score}
          </span>
          <span className="text-[11px] text-slate-500">/ 100</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={quality.score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary/70 transition-all"
            style={{ width: `${quality.score}%` }}
          />
        </div>
      </div>

      <ul className="space-y-1">
        {quality.factors.map((f) => (
          <li
            key={f.id}
            className="flex items-center justify-between text-[11px] text-slate-600"
          >
            <span>{f.label}</span>
            <span className="tabular-nums text-slate-500">
              {f.points}/{f.max}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
