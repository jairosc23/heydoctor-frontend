"use client";

/**
 * AI-1 — Governed AI Request panel (read-only contract from Clinical Plan).
 * Never calls LLM, never builds prompts, never writes EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIRequest } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-request-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIRequestPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIRequest({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const request = result?.request;

  return (
    <div data-testid="governed-ai-request-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Request (AI-1)">
          <p className="mb-3 text-xs text-slate-500">
            Contrato estable de entrada para futuros motores de IA a partir del
            Clinical Plan. Requiere revisión médica · no ejecuta acciones · no
            persiste en EMR · sin LLM · sin prompts.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">
              Cargando Governed AI Request…
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {request ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {request.metadata.status}</span>
                <span>·</span>
                <span>{request.metadata.itemCount} ítems</span>
                <span>·</span>
                <span>builder {request.metadata.builderVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {request.requestItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin ítems de request por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-2"
                  data-testid="governed-ai-request-list"
                >
                  {request.requestItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="governed-ai-request-item"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                        #{item.order} · {item.kind} · {item.layer}
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
