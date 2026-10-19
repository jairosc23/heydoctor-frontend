"use client";

/**
 * CI-8 — Clinical Case Representation panel (read-only reorganization of Review).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalCaseRepresentation } from "@/lib/medical-copilot/clinical-intelligence/case-representation-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function ClinicalCaseRepresentationPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalCaseRepresentation({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const representation = result?.representation;

  return (
    <div data-testid="clinical-case-representation-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Case Representation (CI-8)">
          <p className="mb-3 text-xs text-slate-500">
            Representación estructurada del caso clínico a partir del Review.
            Requiere revisión médica · no ejecuta acciones · no persiste en EMR
            · sin LLM.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando representación…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {representation ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {representation.metadata.status}</span>
                <span>·</span>
                <span>{representation.metadata.sectionCount} secciones</span>
                <span>·</span>
                <span>{representation.metadata.itemCount} ítems</span>
                <span>·</span>
                <span>engine {representation.metadata.engineVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {representation.sections.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin secciones de caso por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-3"
                  data-testid="clinical-case-representation-list"
                >
                  {representation.sections.map((section) => (
                    <li
                      key={section.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-case-section"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {section.title}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {section.summaries.map((summary, idx) => (
                          <li
                            key={`${section.id}-${idx}`}
                            className="text-sm text-slate-800"
                          >
                            {summary}
                          </li>
                        ))}
                      </ul>
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
