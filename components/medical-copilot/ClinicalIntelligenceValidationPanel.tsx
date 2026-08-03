"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalIntelligenceValidation } from "@/lib/medical-copilot/clinical-intelligence/clinical-intelligence-validation";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
export function ClinicalIntelligenceValidationPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalIntelligenceValidation({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.clinicalIntelligenceValidation;
  return (
    <div data-testid="clinical-intelligence-validation-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Intelligence Validation (AI-92)">
          <p className="mb-3 text-xs text-slate-500">Validación estructural de Clinical Intelligence. Sin recomendaciones · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión HeyDoctor Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="clinical-intelligence-validation">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>clinicalIntelligenceValidationId: {model.clinicalIntelligenceValidationId}</span><span>·</span><span>Provider: {model.providerId}</span><span>·</span>
                <span>Estado: {model.metadata.status}</span><span>·</span><span>Slots: {model.metadata.slotCount}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result?.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
