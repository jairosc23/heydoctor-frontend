"use client";

import { SignatureCanvas } from "@/components/clinical/SignatureCanvas";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { CloseHitlAuditTrail } from "@/lib/epic3/close-hitl-execution";
import type { PersistencePreviewPayload } from "@/lib/epic3/persistence-preview";

export function CopilotCloseExecution({
  preview,
  audit,
  gateOk,
  gateReason,
  busy,
  error,
  onApproveH2,
  onExecuteH3,
  onSignH4,
}: {
  preview: PersistencePreviewPayload;
  audit: CloseHitlAuditTrail | null;
  gateOk: boolean;
  gateReason: string | null;
  busy: boolean;
  error: string | null;
  onApproveH2: () => void;
  onExecuteH3: () => void;
  onSignH4: (signatureBase64: string) => void;
}) {
  const h2Ready = gateOk;
  const h3Ready = audit?.h2Status === "approved" && gateOk;
  const h4Ready = audit?.h3Status === "executed" && audit.writeExecuted;

  return (
    <section
      aria-label="Close HITL Execution"
      data-testid="copilot-close-execution"
      className="space-y-hd-3 rounded-hd-md border border-rose-200/70 bg-rose-50/30 px-hd-3 py-hd-3"
    >
      <header className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-900/80">
          EPIC-3 · Close · H2 → H3 → H4
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>
          Persistence Execution + Clinical Signature
        </h3>
        <p className="text-[11px] text-slate-600">
          Persiste únicamente bloques accepted/edited del Persistence Preview.
          Writer SOAP existente · firma vía Consultation · sin regenerar IA.
        </p>
        <dl className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-slate-600">
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">H2</dt>
            <dd>{audit?.h2Status ?? "not_executed"}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">H3</dt>
            <dd>{audit?.h3Status ?? "not_executed"}</dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white/80 px-hd-2 py-hd-1">
            <dt className="uppercase tracking-wide text-slate-400">H4</dt>
            <dd>{audit?.h4Status ?? "not_executed"}</dd>
          </div>
        </dl>
        <p className="font-mono text-[10px] text-slate-500">
          candidatos: {preview.persistenceCandidate.itemCount} · pending:{" "}
          {preview.summary.pending} · discarded: {preview.summary.discarded}
        </p>
      </header>

      {!gateOk ? (
        <p role="status" className="text-[11px] text-amber-800">
          Gate Close: {gateReason ?? "preview_not_ready"}. Resuelva pendientes y
          acepte/edite bloques antes de H2/H3.
        </p>
      ) : null}

      {error ? (
        <p role="alert" className="text-[11px] text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!h2Ready || busy || audit?.h2Status === "approved"}
          onClick={onApproveH2}
          className="clinical-interactive rounded-hd-md border border-emerald-300 bg-white px-2 py-1 text-[11px] font-medium text-emerald-900 disabled:opacity-40"
          data-testid="close-hitl-h2"
        >
          {audit?.h2Status === "approved" ? "H2 dispuesto" : "H2 Disponer paquete (≠ HAB)"}
        </button>
        <button
          type="button"
          disabled={!h3Ready || busy || audit?.h3Status === "executed"}
          onClick={onExecuteH3}
          className="clinical-interactive rounded-hd-md border border-violet-300 bg-white px-2 py-1 text-[11px] font-medium text-violet-900 disabled:opacity-40"
          data-testid="close-hitl-h3"
          title="Persistencia clínica requiere gobernanza HAB — no es Dispose de Copilot"
        >
          {audit?.h3Status === "executed"
            ? "H3 ejecutado"
            : "H3 Ejecutar persistencia"}
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Auditoría
        </p>
        <pre
          data-testid="close-hitl-audit"
          className="max-h-40 overflow-auto rounded-hd-md border border-hd-border-subtle bg-white/90 p-hd-2 font-mono text-[10px] text-slate-700"
        >
          {JSON.stringify(
            {
              previewId: preview.previewId,
              candidateItemIds: audit?.candidateItemIds ?? [],
              excludedDecisions: audit?.excludedDecisions ?? [
                "discarded",
                "pending",
              ],
              approvedActionIds: audit?.approvedActionIds ?? [],
              aiRunIds: audit?.aiRunIds ?? [],
              persistenceId: audit?.persistenceId,
              correlationId: audit?.correlationId,
              writeExecuted: audit?.writeExecuted ?? false,
              rollbackExecuted: audit?.rollbackExecuted ?? false,
              h2: audit?.h2Status,
              h3: audit?.h3Status,
              h4: audit?.h4Status,
            },
            null,
            2,
          )}
        </pre>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          H4 Firma clínica
        </p>
        {!h4Ready ? (
          <p className="text-[11px] text-slate-500">
            Disponible tras H3 exitoso (writeExecuted).
          </p>
        ) : audit?.h4Status === "signed" ? (
          <p className="text-[11px] text-emerald-800">Consulta firmada.</p>
        ) : (
          <div data-testid="close-hitl-h4-canvas">
            <SignatureCanvas
              width={320}
              height={140}
              disabled={busy}
              onSign={(base64) => {
                onSignH4(base64);
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
