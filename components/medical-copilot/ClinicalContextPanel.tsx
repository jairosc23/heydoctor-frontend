"use client";

/**
 * CI-9 — Clinical Context panel (read-only consolidation of Case Representation).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalContext } from "@/lib/medical-copilot/clinical-intelligence/clinical-context-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function ClinicalContextPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalContext({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const context = result?.context;

  return (
    <div data-testid="clinical-context-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Context (CI-9)">
          <p className="mb-3 text-xs text-slate-500">
            Contexto clínico estructurado a partir de la Case Representation.
            Requiere revisión médica · no ejecuta acciones · no persiste en EMR
            · sin LLM.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando contexto clínico…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {context ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {context.metadata.status}</span>
                <span>·</span>
                <span>{context.metadata.itemCount} ítems</span>
                <span>·</span>
                <span>engine {context.metadata.engineVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {context.contextItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin ítems de contexto por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-2"
                  data-testid="clinical-context-list"
                >
                  {context.contextItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-context-item"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {item.layer}
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {item.summary}
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
