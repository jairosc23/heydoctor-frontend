"use client";

/**
 * CI-1 — Clinical Findings panel (read-only consolidation).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { ClinicalFinding } from "@/lib/medical-copilot/clinical-intelligence/findings";
import { useClinicalFindings } from "@/lib/medical-copilot/clinical-intelligence/findings-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const SEVERITY_LABEL: Record<ClinicalFinding["severity"], string> = {
  info: "Info",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function ClinicalFindingsPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalFindings({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="clinical-findings-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Findings (CI-1)">
        <p className="mb-3 text-xs text-slate-500">
          Observaciones consolidadas desde Workspace / Timeline / Memory.
          Requiere revisión médica · no ejecuta acciones · no persiste en EMR.
        </p>

        {!sessionId ? (
          <p className="text-sm text-slate-500">
            Esperando sesión HeyDoctor Copilot…
          </p>
        ) : null}

        {loading ? (
          <p className="text-sm text-slate-500">Cargando findings…</p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>Estado: {result.status}</span>
              <span>·</span>
              <span>{result.collection.count} findings</span>
              <span>·</span>
              <span>engine {result.engineVersion}</span>
              <button
                type="button"
                onClick={refresh}
                className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
              >
                Actualizar
              </button>
            </div>

            {result.collection.findings.length === 0 ? (
              <p className="text-sm text-slate-500">Sin findings por ahora.</p>
            ) : (
              <ul className="space-y-2" data-testid="clinical-findings-list">
                {result.collection.findings.map((finding) => (
                  <li
                    key={finding.id}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2"
                    data-testid="clinical-finding-item"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wide text-slate-700">
                        {finding.category}
                      </span>
                      <span>
                        severidad {SEVERITY_LABEL[finding.severity]}
                      </span>
                      <span>· conf {(finding.confidence * 100).toFixed(0)}%</span>
                      <span>· {finding.source}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-800">
                      {finding.summary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </ClinicalSection>
    </ClinicalPanel>
    </div>
  );
}
