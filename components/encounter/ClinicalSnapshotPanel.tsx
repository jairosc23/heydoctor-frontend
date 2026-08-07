"use client";

/**
 * Clinical Insights / Workspace consumer for Clinical Context Engine.
 * Advisory only — NON_AUTHORITY (authority lives in Workspace hero; avoid badge spam).
 */

import type { ClinicalSnapshot } from "@/lib/clinical-context-engine";
import { resolveClinicalPanelUiState } from "@/lib/encounter/clinical-panel-ui";

export function ClinicalSnapshotPanel({
  snapshot,
  variant = "full",
  loading = false,
}: {
  snapshot: ClinicalSnapshot | null;
  /** Insights = full; other capabilities share the same context lightly. */
  variant?: "full" | "compact";
  /** True while Encounter Memory / runtime is still bootstrapping. */
  loading?: boolean;
}) {
  const uiState = resolveClinicalPanelUiState({
    loading,
    hasData: snapshot != null,
    empty: !loading && snapshot == null,
  });

  if (uiState === "loading") {
    return (
      <section
        aria-label="Clinical Snapshot"
        data-testid="clinical-context-snapshot"
        data-ui-state="loading"
        data-ready="false"
        data-variant={variant}
        className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-500"
        role="status"
      >
        Cargando Clinical Snapshot desde Encounter Memory…
      </section>
    );
  }

  if (uiState === "empty" || !snapshot) {
    return (
      <section
        aria-label="Clinical Snapshot"
        data-testid="clinical-context-snapshot"
        data-ui-state="empty"
        data-ready="false"
        data-variant={variant}
        className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-500"
        role="status"
      >
        <p className="font-medium text-slate-700">
          Sin Clinical Snapshot disponible
        </p>
        <p className="mt-1 leading-relaxed">
          Encounter Memory no está montado en este encuentro, por eso el Clinical
          Context Engine no puede construir el contexto compartido.
        </p>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <section
        aria-label="Clinical Snapshot"
        data-testid="clinical-context-snapshot"
        data-ui-state="ready"
        data-ready="true"
        data-variant="compact"
        data-authority={snapshot.authorityClass}
        data-version={snapshot.version}
        className="rounded-hd-md border border-primary/10 bg-primaryLight/15 px-hd-3 py-hd-2 text-[11px] text-slate-700"
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          Shared Clinical Context
        </p>
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
      data-ui-state="ready"
      data-ready="true"
      data-authority={snapshot.authorityClass}
      data-version={snapshot.version}
      className="space-y-hd-3 rounded-hd-md border border-primary/15 bg-primaryLight/20 px-hd-3 py-hd-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
          Clinical Snapshot
        </p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-700">
          {snapshot.encounterSummary}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <SnapshotBlock
          label="Problemas activos"
          empty="Ninguno registrado en Encounter Memory para este encuentro."
          items={snapshot.activeProblems}
        />
        <SnapshotBlock
          label="Medicamentos"
          empty="No aportados al contexto compartido (sin selector local)."
          items={snapshot.medications}
        />
        <SnapshotBlock
          label="Alergias"
          empty="No aportadas al contexto compartido (puede ser vacío real)."
          items={snapshot.allergies}
        />
        <SnapshotBlock
          label="Prioridades"
          empty="Sin prioridades derivadas del contexto actual."
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
        Motivo: {snapshot.consultationReason ?? "no disponible"} · Vitales:{" "}
        {snapshot.vitalSignsSummary ?? "no disponibles"} · Fase:{" "}
        {snapshot.workflowPhase ?? "no definida"} · Pendientes:{" "}
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
    <div
      className="rounded-hd-md border border-hd-border-subtle bg-white/70 px-hd-2 py-hd-2"
      data-ui-state={items.length > 0 ? "ready" : "empty"}
    >
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
