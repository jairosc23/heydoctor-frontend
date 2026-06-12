"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { CopilotContextView } from "@/lib/clinical-copilot-mock";
import { CopilotSourceStrip } from "./CopilotSourceStrip";

function ContextRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-2 py-hd-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={
          mono
            ? "mt-0.5 font-mono text-xs text-slate-800"
            : "mt-0.5 text-xs leading-snug text-slate-800"
        }
      >
        {value}
      </p>
    </div>
  );
}

export function CopilotContextEngine({ context }: { context: CopilotContextView }) {
  return (
    <section aria-label="Context Engine" className="space-y-hd-3">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Context Engine™</h3>
        <p className="text-[11px] text-slate-500">
          Información clínica en observación (solo visualización)
        </p>
      </div>

      <CopilotSourceStrip sources={context.sources} />

      <div className="grid gap-hd-2">
        <ContextRow
          label="Diagnóstico activo"
          value={context.activeDiagnosis ?? "No disponible en contexto"}
        />
        <ContextRow
          label="SOAP — plan"
          value={context.soapSummary.plan}
        />
        <ContextRow
          label="SOAP — notas"
          value={context.soapSummary.notesPreview}
        />
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Medicamentos activos (mock)
        </p>
        <ul className="space-y-1">
          {context.activeMedications.map((med) => (
            <li
              key={med}
              className="rounded-hd-md border border-hd-border-subtle bg-teal-50/40 px-hd-2 py-1 text-xs text-slate-700"
            >
              {med}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Timeline reciente (mock)
        </p>
        <ul className="space-y-1">
          {context.recentTimeline.map((item) => (
            <li
              key={item}
              className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-2 py-1 text-xs text-slate-700"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Laboratorios (mock)
        </p>
        <ul className="flex flex-wrap gap-1">
          {context.pendingLabs.map((lab) => (
            <li
              key={lab}
              className="rounded-full border border-amber-200/80 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-900"
            >
              {lab}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
