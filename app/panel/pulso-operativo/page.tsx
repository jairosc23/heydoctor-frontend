"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadOperationalPulse,
  type OperationalPulseDashboard,
  type OperationalPulseStatus,
} from "@/lib/product-platform/operational-pulse";

const STATUS_LABEL: Record<OperationalPulseStatus, string> = {
  clear: "Sin presión operativa",
  delivery_pressure: "Presión de entrega",
  commercial_pressure: "Presión comercial",
  continuity_pressure: "Presión de continuidad",
  mixed: "Presión mixta",
};

export default function OperationalPulsePage() {
  const [pulse, setPulse] = useState<OperationalPulseDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadOperationalPulse()
      .then((next) => {
        if (!cancelled) setPulse(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el pulso operativo.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4" data-testid="operational-pulse-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pulso operativo</h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Fotografía operacional del centro. La entrega y el cobro se completan
          en los tableros certificados.
        </p>
      </div>

      {pulse ? (
        <p
          className="text-sm font-semibold text-slate-800"
          data-testid="operational-pulse-status"
          data-pulse-status={pulse.pulseStatus}
        >
          {STATUS_LABEL[pulse.pulseStatus]}
        </p>
      ) : null}

      {pulse ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          data-testid="operational-pulse-metrics"
        >
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Backlog de entrega
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseDeliveryBacklog}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Riesgo comercial
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseCommercialAtRisk}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Cierre comercial
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseCommercialClosed}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Pacientes
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulsePatientsScanned}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Briefs listos
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseBriefReady}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Briefs vacíos
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseBriefEmpty}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Último handoff ausente
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {pulse.metrics.pulseLastHandoffAbsent}
            </dd>
          </div>
        </dl>
      ) : null}

      {pulse ? (
        <ul
          className="space-y-1 text-sm text-slate-600"
          data-testid="operational-pulse-alerts"
        >
          {pulse.alerts.alertDeliveryBacklog ? (
            <li>Hay documentos pendientes de entrega.</li>
          ) : null}
          {pulse.alerts.alertCommercialAtRisk ? (
            <li>Hay riesgo comercial (impago o anomalía de lock).</li>
          ) : null}
          {pulse.alerts.alertLastHandoffAbsent ? (
            <li>Hay visitas recientes sin handoff clínico.</li>
          ) : null}
          {pulse.alerts.alertBriefEmpty ? (
            <li>Hay pacientes sin acto certificado previo.</li>
          ) : null}
        </ul>
      ) : null}

      {pulse ? (
        <p className="text-xs text-slate-500" data-testid="operational-pulse-composition">
          Arranque listo {pulse.composition.briefReadyShare}% · vacío{" "}
          {pulse.composition.briefEmptyShare}% · riesgo comercial{" "}
          {pulse.composition.commercialAtRiskShare}%
        </p>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!pulse && !error ? (
        <p className="text-sm text-slate-500">Cargando pulso…</p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/panel/entrega-clinica"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Abrir entrega clínica
        </Link>
        <Link
          href="/panel/integridad-ingresos"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Abrir integridad de ingresos
        </Link>
      </div>
    </div>
  );
}
