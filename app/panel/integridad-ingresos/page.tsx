"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  loadRevenueIntegrityDashboard,
  type RevenueIntegrityBucket,
  type RevenueIntegrityDashboard,
} from "@/lib/product-platform/revenue-integrity";

const BUCKET_LABEL: Record<RevenueIntegrityBucket, string> = {
  signed_unpaid: "Firmado impago",
  payment_verified: "Pago verificado sin comprobante",
  invoiced: "Comprobante sin lock comercial",
  commercially_locked: "Cierre comercial",
  lock_anomaly: "Anomalía de lock",
  unclassified: "Sin clasificar",
};

export default function RevenueIntegrityPage() {
  const [dashboard, setDashboard] = useState<RevenueIntegrityDashboard | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadRevenueIntegrityDashboard()
      .then((next) => {
        if (!cancelled) setDashboard(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar la integridad de ingresos.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4" data-testid="revenue-integrity-page">
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Integridad de ingresos
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-primaryDark/70">
          Funnel comercial certificado por consulta. No cobra ni repara: abra la
          ficha para pagar, emitir comprobante u observar el lock.
        </p>
      </div>

      {dashboard ? (
        <dl
          className="grid grid-cols-2 gap-3 sm:grid-cols-5"
          data-testid="revenue-integrity-metrics"
        >
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Impagos
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {dashboard.metrics.signedUnpaidCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Sin boleta
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {dashboard.metrics.verifiedWithoutInvoiceCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Sin lock
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {dashboard.metrics.invoicedUnlockedCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Anomalías
            </dt>
            <dd className="text-lg font-semibold text-red-800">
              {dashboard.metrics.lockAnomalyCount}
            </dd>
          </div>
          <div className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Cerrados
            </dt>
            <dd className="text-lg font-semibold text-slate-900">
              {dashboard.metrics.commerciallyLockedCount}
            </dd>
          </div>
        </dl>
      ) : null}

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!dashboard && !error ? (
        <p className="text-sm text-slate-500">Cargando tablero…</p>
      ) : null}

      {dashboard && dashboard.items.length === 0 ? (
        <p className="text-sm text-slate-600">
          No hay consultas firmadas o bloqueadas para clasificar.
        </p>
      ) : null}

      {dashboard && dashboard.items.length > 0 ? (
        <ul className="space-y-2" data-testid="revenue-integrity-list">
          {dashboard.items.map((item) => (
            <li
              key={item.encounterId}
              className="rounded-hd-md border border-hd-border-subtle bg-white px-3 py-2"
              data-bucket={item.bucket}
            >
              <p
                className={
                  item.bucket === "lock_anomaly"
                    ? "text-sm font-semibold text-red-800"
                    : "text-sm font-semibold text-slate-800"
                }
              >
                {BUCKET_LABEL[item.bucket]}
              </p>
              <p className="text-xs text-slate-600">
                Encounter {item.encounterStatus}
                {item.settlementState ? ` · Settlement ${item.settlementState}` : ""}
                {item.isPaid ? " · pagado" : " · no pagado"}
              </p>
              <p className="font-mono text-[10px] text-slate-500">
                EncounterId {item.encounterId}
              </p>
              {item.settlementId ? (
                <p className="font-mono text-[10px] text-slate-500">
                  SettlementId {item.settlementId}
                </p>
              ) : null}
              <p className="font-mono text-[10px] text-slate-400">
                asOf {item.asOf}
              </p>
              <Link
                href={`/panel/consultas/${item.encounterId}`}
                className="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Abrir consulta
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
