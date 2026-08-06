"use client";

/**
 * Clinical Insights consumer for Clinical Context Engine (Sprint 1).
 * Advisory only — NON_AUTHORITY.
 */

import type { ClinicalSnapshot } from "@/lib/clinical-context-engine";
import { CLINICAL_CONTEXT_ENGINE_GOVERNANCE } from "@/lib/clinical-context-engine";

export function ClinicalSnapshotPanel({
  snapshot,
  variant = "full",
}: {
  snapshot: ClinicalSnapshot | null;
  /** Insights = full; other capabilities share the same context lightly. */
  variant?: "full" | "compact";
}) {
  if (!snapshot) {
    return (
      <section
        aria-label="Clinical Snapshot"
        data-testid="clinical-context-snapshot"
        data-ready="false"
        data-variant={variant}
        className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-500"
      >
        Encounter Memory no disponible — Clinical Context Engine en espera.
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <section
        aria-label="Clinical Snapshot"
        data-testid="clinical-context-snapshot"
        data-ready="true"
        data-variant="compact"
        data-authority={snapshot.authorityClass}
        data-version={snapshot.version}
        className="rounded-hd-md border border-primary/10 bg-primaryLight/15 px-hd-3 py-hd-2 text-[11px] text-slate-700"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Shared Clinical Context
          </p>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-900">
            {CLINICAL_CONTEXT_ENGINE_GOVERNANCE.authorityClass}
          </span>
        </div>
        <p className="mt-1 leading-relaxed">{snapshot.encounterSummary}</p>
        <p className="mt-1 text-[10px] text-slate-500">
          Prioridades: {snapshot.priorities.length} · Gaps:{" "}
          {snapshot.missingCritical.length} · Pendientes:{" "}
          {snapshot.pendingActions.length}
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Clinical Snapshot"
      data-testid="clinical-context-snapshot"
      data-ready="true"
      data-authority={snapshot.authorityClass}
      data-version={snapshot.version}
      className="space-y-hd-3 rounded-hd-md border border-primary/15 bg-primaryLight/20 px-hd-3 py-hd-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            Clinical Snapshot
          </p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
            {snapshot.encounterSummary}
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-900">
          {CLINICAL_CONTEXT_ENGINE_GOVERNANCE.authorityClass}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <SnapshotBlock
          label="Problemas activos"
          empty="Ninguno registrado"
          items={snapshot.activeProblems}
        />
        <SnapshotBlock
          label="Medicamentos"
          empty="No aportados al contexto"
          items={snapshot.medications}
        />
        <SnapshotBlock
          label="Alergias"
          empty="No aportadas al contexto"
          items={snapshot.allergies}
        />
        <SnapshotBlock
          label="Prioridades"
          empty="Sin prioridades derivadas"
          items={snapshot.priorities.map(
            (p) => `${p.label} (${p.urgency})`,
          )}
        />
      </div>

      {snapshot.missingCritical.length > 0 ? (
        <div>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Información faltante
          </p>
          <ul className="space-y-1">
            {snapshot.missingCritical.map((gap) => (
              <li
                key={gap.id}
                className="rounded-hd-md border border-slate-200 bg-white/80 px-hd-2 py-1 text-[11px] text-slate-700"
                data-severity={gap.severity}
              >
                {gap.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="text-[10px] text-slate-500">
        Motivo: {snapshot.consultationReason ?? "—"} · Vitales:{" "}
        {snapshot.vitalSignsSummary ?? "—"} · Fase:{" "}
        {snapshot.workflowPhase ?? "—"} · Pendientes:{" "}
        {snapshot.pendingActions.length}
      </p>
    </section>
  );
}

function SnapshotBlock({
  label,
  items,
  empty,
}: {
  label: string;
  items: string[];
  empty: string;
}) {
  return (
    <div className="rounded-hd-md border border-hd-border-subtle bg-white/70 px-hd-2 py-hd-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="mt-0.5 text-[11px] text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-0.5 space-y-0.5">
          {items.slice(0, 5).map((item) => (
            <li key={item} className="text-[11px] leading-snug text-slate-800">
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
