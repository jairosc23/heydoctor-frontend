"use client";

import { useEffect, useState } from "react";
import { fetchInvoiceDashboard } from "@/lib/services/invoices";
import { fetchLabOrdersByPatient } from "@/lib/services/lab-orders";
import { fetchPrescriptionsByPatient } from "@/lib/services/prescriptions";
import { fetchReferralsByPatient } from "@/lib/services/referrals";
import {
  buildOrdersSummary,
  collectOrderStatuses,
  type OrdersSummary,
} from "@/lib/orders-command-center";

export function OrdersOverview({
  patientId,
  consultationId,
  refreshKey = 0,
}: {
  patientId: string;
  consultationId: string;
  refreshKey?: number;
}) {
  const [summary, setSummary] = useState<OrdersSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [prescriptions, labOrders, referrals, invoiceDash] =
          await Promise.all([
            fetchPrescriptionsByPatient(patientId),
            fetchLabOrdersByPatient(patientId),
            fetchReferralsByPatient(patientId),
            fetchInvoiceDashboard(),
          ]);

        const invoices = (invoiceDash.invoices ?? []).filter(
          (invoice) => invoice.consultationId === consultationId,
        );

        const statuses = collectOrderStatuses({
          prescriptions,
          labOrders,
          referrals,
          invoices,
        });

        if (!cancelled) {
          setSummary(buildOrdersSummary(statuses));
        }
      } catch {
        if (!cancelled) {
          setSummary({ active: 0, completed: 0, pending: 0, total: 0 });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [patientId, consultationId, refreshKey]);

  return (
    <header className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Orders Command Center™
      </p>
      <h2 className="text-base font-semibold text-slate-900">Órdenes</h2>
      {loading ? (
        <p className="mt-1 text-xs text-slate-500">Resumiendo bandeja clínica…</p>
      ) : summary ? (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
          <span>
            <span className="font-semibold tabular-nums text-slate-900">
              {summary.active}
            </span>{" "}
            activas
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-900">
              {summary.completed}
            </span>{" "}
            completadas
          </span>
          <span>
            <span className="font-semibold tabular-nums text-slate-900">
              {summary.pending}
            </span>{" "}
            pendientes
          </span>
        </div>
      ) : null}
    </header>
  );
}
