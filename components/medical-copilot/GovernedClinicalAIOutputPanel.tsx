"use client";

/**
 * AI-13 — GovernedClinicalAIOutput panel (diagnostic only).
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalAIOutput } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-ai-output";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedClinicalAIOutputPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalAIOutput({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const model = result?.output;

  return (
    <div data-testid="governed-clinical-ai-output-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Clinical AI Output (AI-13)">
          <p className="mb-3 text-xs text-slate-500">
            Contrato público de salida clínica estructural. Sin diagnósticos · sin tratamientos · HITL obligatorio.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {model ? (
            <div className="space-y-3" data-testid="governed-clinical-ai-output">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>outputId: {model.outputId}</span>
                <span>·</span>
                <span>Provider: {model.providerId}</span>
                <span>·</span>
                <span>Slots: {model.metadata.slotCount}</span>
                <span>·</span>
                <span>Estado: {model.metadata.status}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {result?.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
