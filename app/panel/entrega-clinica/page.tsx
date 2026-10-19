"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadClinicalDeliveryQueue,
  type ClinicalDeliveryQueue,
} from "@/lib/product-platform";

export default function ClinicalDeliveryQueuePage() {
  const [queue, setQueue] = useState<ClinicalDeliveryQueue | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadClinicalDeliveryQueue()
      .then((next) => {
        if (!cancelled) setQueue(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la cola de entrega.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4" data-testid="clinical-delivery-queue-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Cola de entrega clínica
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Actos vigentes en documento listo que aún no se han entregado. La
          entrega se completa en la consulta certificada. El pago no oculta un
          documento pendiente.
        </p>
      </div>

      {queue ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
          data-testid="clinical-delivery-queue-metrics"
        >
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Pendientes
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {queue.metrics.pendingDeliveryCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Recetas
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {queue.metrics.pendingPrescriptionCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Resúmenes
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {queue.metrics.pendingVisitSummaryCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Revisados
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {queue.metrics.encountersScanned}
            </dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!queue && !error ? (
        <p className="text-sm text-slate-500">Cargando cola…</p>
      ) : null}

      {queue && queue.items.length === 0 ? (
        <p className="text-sm text-slate-600">
          No hay entregas clínicas pendientes.
        </p>
      ) : null}

      {queue && queue.items.length > 0 ? (
        <ul className="space-y-2" data-testid="clinical-delivery-queue-list">
          {queue.items.map((item) => (
            <li
              key={`${item.encounterId}:${item.clinicalActId}`}
              className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2"
            >
              <Link
                href={`/panel/consultas/${item.encounterId}`}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Abrir consulta para entregar
              </Link>
              <p className="mt-1 font-mono text-[10px] text-slate-500">
                EncounterId {item.encounterId}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                ClinicalActId {item.clinicalActId}
              </p>
              <p className="text-xs text-slate-600">
                {item.documentKind === "prescription"
                  ? "Receta"
                  : item.documentKind === "visit_summary"
                    ? "Resumen de visita"
                    : "Documento clínico"}
              </p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
