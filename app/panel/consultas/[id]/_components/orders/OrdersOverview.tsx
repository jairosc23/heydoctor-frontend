"use client";

import { useEffect, useState } from "react";
import { ClinicalStatusBadge } from "@/components/clinical/design";
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
    <header className="orders-priority-header rounded-hd-lg border border-hd-border-subtle bg-gradient-to-br from-hd-surface-muted to-hd-surface-raised px-hd-4 py-hd-3 shadow-hd-1">
      <div className="heydoctor-presence space-y-hd-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Orders Command Center™
        </p>
        <h2 className="text-base font-semibold text-slate-900">Órdenes</h2>
      </div>
      {loading ? (
        <p className="mt-hd-2 text-xs text-slate-500">Resumiendo bandeja clínica…</p>
      ) : summary ? (
        <div className="mt-hd-3 flex min-h-[1.375rem] flex-wrap items-center gap-2">
          <ClinicalStatusBadge
            status="active"
            label={`${summary.active} activas`}
            className="w-fit"
          />
          <ClinicalStatusBadge
            status="completed"
            label={`${summary.completed} completadas`}
            className="w-fit"
          />
          <ClinicalStatusBadge
            status="pending"
            label={`${summary.pending} pendientes`}
            className="w-fit"
          />
        </div>
      ) : null}
    </header>
  );
}
