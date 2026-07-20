"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type {
  PreVisitClinicalSnapshotView,
  SnapshotSection,
} from "@/lib/epic3/pre-visit-clinical-snapshot";

function availabilityLabel(section: SnapshotSection): string {
  switch (section.availability) {
    case "has_data":
      return `${section.lines.length} registro(s)`;
    case "empty":
      return "Sin registros";
    default:
      return "No disponible";
  }
}

export function CopilotPreVisitClinicalSnapshot({
  view,
}: {
  view: PreVisitClinicalSnapshotView;
}) {
  return (
    <section
      aria-label="Pre-Visit Clinical Snapshot"
      data-testid="copilot-pre-visit-clinical-snapshot"
      className="space-y-hd-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          EPIC-3 · Prep · Snapshot determinístico
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>{view.title}</h3>
        <p className="text-[11px] text-slate-500">
          Solo datos existentes en Clinical Foundation · sin IA · sin EMR
          {view.patientLabel ? ` · ${view.patientLabel}` : ""}
        </p>
      </div>

      {!view.foundationReady ? (
        <p className="text-[11px] text-slate-500">
          Clinical Foundation no cargado — snapshot no disponible.
        </p>
      ) : null}

      <div className="space-y-hd-2">
        {view.sections.map((section) => (
          <div
            key={section.id}
            data-testid={`snapshot-section-${section.id}`}
            data-availability={section.availability}
            className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-2"
          >
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <p className="text-xs font-medium text-slate-800">{section.title}</p>
              <span className="text-[10px] uppercase tracking-wide text-slate-400">
                {availabilityLabel(section)}
              </span>
            </div>
            {section.availability === "has_data" ? (
              <ul className="space-y-0.5">
                {section.lines.map((line) => (
                  <li
                    key={line.id}
                    className="text-[11px] leading-snug text-slate-700"
                  >
                    {line.text}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-500">{section.source}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
