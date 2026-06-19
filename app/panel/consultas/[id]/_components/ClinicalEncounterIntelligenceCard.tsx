"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ClinicalEncounterIntelligenceModel } from "./clinical-encounter-intelligence-model";
import { ClinicalEncounterInsights } from "./ClinicalEncounterInsights";
import { ClinicalEncounterWarnings } from "./ClinicalEncounterWarnings";

function readinessLabel(ready: boolean) {
  return ready ? "Firma lista" : "Firma pendiente";
}

export function ClinicalEncounterIntelligenceCard({
  model,
  compact = false,
}: {
  model: ClinicalEncounterIntelligenceModel | null;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!model || model.topSignals.length === 0) return null;

  const topSignalIds = new Set(model.topSignals.map((signal) => signal.id));
  const detailWarnings = model.warnings.filter(
    (signal) => !topSignalIds.has(signal.id),
  );
  const detailInsights = model.insights.filter(
    (signal) => !topSignalIds.has(signal.id),
  );
  const hiddenCount = detailWarnings.length + detailInsights.length;

  return (
    <section
      aria-label="Clinical Encounter Intelligence Layer"
      className={cn(
        "rounded-hd-lg border border-hd-border-subtle bg-white px-hd-4 py-hd-3 shadow-hd-1",
        !expanded && "max-h-24 overflow-hidden",
      )}
      data-testid="clinical-encounter-intelligence-card"
      data-expanded={expanded ? "true" : "false"}
      data-signature-ready={
        model.sourceOfTruth.signatureReady ? "true" : "false"
      }
      data-completion-percentage={model.sourceOfTruth.completionPercentage}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            Clinical Encounter Intelligence™
          </p>
          <p className="text-sm font-semibold text-slate-900">
            Señales clínicas priorizadas
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
          <span className="rounded-full border border-hd-border-subtle bg-hd-surface-muted px-2 py-0.5 font-medium">
            {model.sourceOfTruth.completionPercentage}% completo
          </span>
          <span className="rounded-full border border-hd-border-subtle bg-hd-surface-muted px-2 py-0.5 font-medium">
            {readinessLabel(model.sourceOfTruth.signatureReady)}
          </span>
          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="rounded-full border border-primary/20 bg-primaryLight px-2 py-0.5 font-semibold text-primary"
              aria-expanded={expanded}
            >
              {expanded ? "Contraer" : `Ver ${hiddenCount} más`}
            </button>
          ) : null}
        </div>
      </div>

      <ClinicalEncounterWarnings
        signals={model.topSignals}
        compact={compact}
      />

      {expanded ? (
        <div className="mt-hd-3 space-y-hd-3 border-t border-hd-border-subtle pt-hd-3">
          <ClinicalEncounterWarnings signals={detailWarnings} compact={compact} />
          <ClinicalEncounterInsights insights={detailInsights} />
        </div>
      ) : null}
    </section>
  );
}
