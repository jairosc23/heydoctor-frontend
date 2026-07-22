"use client";

import type {
  CriticalJustification,
  SafetyAlert,
  SafetyConfidence,
  SafetyPriority,
  SafetySeverity,
  WarningAcknowledgement,
} from "@/lib/prescription-safety";
import {
  CRITICAL_REASON_CODES,
  isJustificationComplete,
} from "@/lib/prescription-safety";

const SEVERITY_STYLES: Record<
  SafetySeverity,
  { border: string; bg: string; badge: string; label: string }
> = {
  CRITICAL: {
    border: "border-red-300",
    bg: "bg-red-50",
    badge: "bg-red-600 text-white",
    label: "CRITICAL",
  },
  WARNING: {
    border: "border-amber-300",
    bg: "bg-amber-50",
    badge: "bg-amber-500 text-white",
    label: "WARNING",
  },
  INFO: {
    border: "border-sky-200",
    bg: "bg-sky-50",
    badge: "bg-sky-600 text-white",
    label: "INFO",
  },
};

export interface SafetyAlertCardProps {
  alert: SafetyAlert;
  acknowledgement?: WarningAcknowledgement;
  justification?: CriticalJustification;
  onAcknowledge?: (alertId: string) => void;
  onRevokeAck?: (alertId: string) => void;
  onJustificationChange?: (next: CriticalJustification) => void;
}

export function SafetyAlertCard({
  alert,
  acknowledgement,
  justification,
  onAcknowledge,
  onRevokeAck,
  onJustificationChange,
}: SafetyAlertCardProps) {
  const style = SEVERITY_STYLES[alert.severity];
  const acked = Boolean(acknowledgement);
  const justified = isJustificationComplete(justification);

  return (
    <article
      className={`rounded-md border ${style.border} ${style.bg} p-3`}
      data-testid={`safety-alert-${alert.alertId}`}
      data-severity={alert.severity}
      data-priority={alert.priority}
      data-confidence={alert.confidence}
      aria-label={`Alerta ${style.label}: ${alert.message}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${style.badge}`}
          >
            {style.label}
          </span>
          <MetaChip label="Prioridad" value={alert.priority} />
          <MetaChip label="Confidence" value={alert.confidence} />
          {alert.lineIndexes.length > 0 ? (
            <MetaChip
              label="Líneas"
              value={alert.lineIndexes.map((i) => i + 1).join(", ")}
            />
          ) : null}
        </div>
        <span className="text-[10px] text-slate-500">{alert.ruleId}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-slate-900">{alert.message}</p>
      {alert.evidenceSummary ? (
        <p className="mt-1 text-xs text-slate-600">{alert.evidenceSummary}</p>
      ) : null}

      {alert.severity === "WARNING" && alert.requires === "ack" ? (
        <div className="mt-3">
          <label className="flex cursor-pointer items-start gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={acked}
              onChange={(e) => {
                if (e.target.checked) onAcknowledge?.(alert.alertId);
                else onRevokeAck?.(alert.alertId);
              }}
              className="mt-0.5 rounded border-slate-400 text-amber-600 focus:ring-2 focus:ring-amber-500"
              aria-label={`Reconozco la alerta: ${alert.message}`}
              data-testid={`safety-ack-${alert.alertId}`}
            />
            <span>He revisado esta advertencia</span>
          </label>
        </div>
      ) : null}

      {alert.severity === "CRITICAL" && alert.requires === "justification" ? (
        <div className="mt-3 space-y-2" data-testid={`safety-just-${alert.alertId}`}>
          <label className="block text-xs font-medium text-slate-700">
            Justificación clínica (obligatoria para documentar)
            <select
              value={justification?.reasonCode ?? ""}
              onChange={(e) =>
                onJustificationChange?.({
                  alertId: alert.alertId,
                  reasonCode: e.target.value,
                  reasonText: justification?.reasonText ?? "",
                  justifiedAt: new Date().toISOString(),
                })
              }
              className="mt-1 w-full rounded border border-red-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Motivo de justificación para ${alert.message}`}
            >
              <option value="">Seleccionar motivo…</option>
              {CRITICAL_REASON_CODES.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-700">
            Detalle
            <textarea
              value={justification?.reasonText ?? ""}
              onChange={(e) =>
                onJustificationChange?.({
                  alertId: alert.alertId,
                  reasonCode: justification?.reasonCode ?? "",
                  reasonText: e.target.value,
                  justifiedAt: new Date().toISOString(),
                })
              }
              rows={2}
              placeholder={
                justification?.reasonCode === "other"
                  ? "Especificar motivo (obligatorio)"
                  : "Notas clínicas adicionales (opcional salvo «Otro»)"
              }
              className="mt-1 w-full rounded border border-red-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label={`Detalle de justificación para ${alert.message}`}
            />
          </label>
          {justified ? (
            <p className="text-xs font-medium text-red-800" role="status">
              Justificación registrada (la emisión no se bloquea)
            </p>
          ) : (
            <p className="text-xs text-red-700" role="status">
              Complete la justificación para dejar documentada la decisión
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}

function MetaChip({
  label,
  value,
}: {
  label: string;
  value: SafetyPriority | SafetyConfidence | string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-white/80 bg-white/80 px-1.5 py-0.5 text-[10px] text-slate-700">
      <span className="font-medium text-slate-500">{label}:</span>
      {value}
    </span>
  );
}
