"use client";

/**
 * CP-31 — ClinicalDictationPanel (visual only).
 * In-memory transcript — never writes SOAP / EMR / Workspace artifacts.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import { useClinicalDictation } from "@/context/ClinicalDictationContext";
import type { DictationStatus } from "@/lib/medical-copilot/dictation/types";

function statusLabel(status: DictationStatus): string {
  switch (status) {
    case "idle":
      return "Inactivo";
    case "starting":
      return "Iniciando";
    case "listening":
      return "Escuchando";
    case "paused":
      return "Pausado";
    case "finalizing":
      return "Finalizando";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    case "error":
      return "Error";
    default:
      return status;
  }
}

function statusBadge(
  status: DictationStatus,
): "active" | "pending" | "draft" | "completed" | "critical" {
  switch (status) {
    case "listening":
    case "starting":
    case "finalizing":
      return "active";
    case "completed":
      return "completed";
    case "cancelled":
    case "error":
      return "critical";
    case "paused":
      return "pending";
    default:
      return "draft";
  }
}

export function ClinicalDictationPanel() {
  const {
    status,
    active,
    buffer,
    session,
    start,
    stop,
    cancel,
    clearBuffer,
    setDraft,
    finalize,
  } = useClinicalDictation();

  return (
    <ClinicalPanel depth={2} className="min-h-[12rem]">
      <ClinicalSection title="Dictado clínico por voz">
        <p className="mb-3 text-sm text-slate-500">
          Transcript solo en memoria del navegador. No se escribe en SOAP, EMR
          ni artifacts del Workspace.
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ClinicalStatusBadge
            status={statusBadge(status)}
            label={statusLabel(status)}
          />
          {session?.providerId ? (
            <span className="text-xs text-slate-500">
              provider · {session.providerId}
            </span>
          ) : null}
          {session?.error ? (
            <span className="text-xs text-red-600">{session.error}</span>
          ) : null}
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            disabled={active}
            onClick={() => void start()}
          >
            Iniciar dictado
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50"
            disabled={!active}
            onClick={() => void stop()}
          >
            Finalizar escucha
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50"
            disabled={status === "idle"}
            onClick={() => void cancel("user_cancel")}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700"
            onClick={() => clearBuffer()}
          >
            Limpiar buffer
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-50"
            disabled={status === "idle" || status === "completed"}
            onClick={() => finalize()}
          >
            Marcar completado
          </button>
        </div>

        {buffer.partial ? (
          <p className="mb-2 text-xs text-slate-500" aria-live="polite">
            Parcial: <span className="italic text-slate-600">{buffer.partial}</span>
          </p>
        ) : null}

        <label className="block text-sm font-medium text-slate-700">
          Buffer editable
          <textarea
            className="mt-1 min-h-[8rem] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            value={buffer.draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="El dictado aparecerá aquí. Puede editarlo libremente."
            spellCheck
          />
        </label>
      </ClinicalSection>
    </ClinicalPanel>
  );
}
