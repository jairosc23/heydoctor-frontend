"use client";

/**
 * CI-6 — Clinical Copilot Snapshot panel (orchestrated CI-1…CI-5 view).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalCopilotSnapshot } from "@/lib/medical-copilot/clinical-intelligence/snapshot-hooks";
import type { ClinicalCopilotSnapshotItem } from "@/lib/medical-copilot/clinical-intelligence/snapshot";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function LayerList({
  title,
  items,
}: {
  title: string;
  items: ClinicalCopilotSnapshotItem[];
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
        {title} ({items.length})
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Vacío</p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800"
            >
              {item.category ? (
                <span className="mr-2 text-xs uppercase text-slate-500">
                  {item.category}
                </span>
              ) : null}
              {item.summary}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClinicalCopilotSnapshotPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalCopilotSnapshot({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const snapshot = result?.snapshot;

  return (
    <div data-testid="clinical-copilot-snapshot-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Copilot Snapshot (CI-6)">
          <p className="mb-3 text-xs text-slate-500">
            Vista unificada de Findings → Insights → Recommendations →
            Decisions → Reasoning. Requiere revisión médica · no ejecuta
            acciones · no persiste en EMR.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando snapshot…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {snapshot ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {snapshot.metadata.status}</span>
                <span>·</span>
                <span>
                  F{snapshot.metadata.counts.findings}/I
                  {snapshot.metadata.counts.insights}/R
                  {snapshot.metadata.counts.recommendations}/D
                  {snapshot.metadata.counts.decisions}/G
                  {snapshot.metadata.counts.reasoning}
                </span>
                <span>·</span>
                <span>orch {snapshot.metadata.orchestratorVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              <div
                className="space-y-3"
                data-testid="clinical-copilot-snapshot-layers"
              >
                <LayerList title="Findings" items={snapshot.findings} />
                <LayerList title="Insights" items={snapshot.insights} />
                <LayerList
                  title="Recommendations"
                  items={snapshot.recommendations}
                />
                <LayerList title="Decisions" items={snapshot.decisions} />
                <LayerList title="Reasoning" items={snapshot.reasoning} />
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
