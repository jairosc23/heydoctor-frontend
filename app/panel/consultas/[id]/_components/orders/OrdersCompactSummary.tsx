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

export function OrdersCompactSummary({
  patientId,
  consultationId,
  refreshKey = 0,
}: {
  patientId: string;
  consultationId: string;
  refreshKey?: number;
}) {
  const [summary, setSummary] = useState<OrdersSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
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
          setSummary(null);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [patientId, consultationId, refreshKey]);

  if (!summary) return null;

  const activeLabel =
    summary.active === 1 ? "1 activa" : `${summary.active} activas`;
  const pendingLabel =
    summary.pending === 1 ? "1 pendiente" : `${summary.pending} pendientes`;

  return (
    <span
      className="hidden font-normal text-slate-400 sm:inline"
      data-testid="orders-compact-summary"
    >
      · {activeLabel} · {pendingLabel}
    </span>
  );
}
