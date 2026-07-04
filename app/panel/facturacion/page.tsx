"use client";

import React, { useEffect, useState } from "react";
import {
  fetchInvoiceDashboard,
  downloadInvoicePdf,
  type InvoiceDashboard,
  type ClinicalInvoice,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import Card from "@/components/ui/Card";
import DashboardCard from "@/components/ui/DashboardCard";

const FONT_HEADING = "Montserrat, sans-serif";

function formatClp(n: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FacturacionPage() {
  const [data, setData] = useState<InvoiceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchInvoiceDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, "No se pudo cargar facturación"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePdf = async (inv: ClinicalInvoice) => {
    setPdfLoadingId(inv.id);
    try {
      await downloadInvoicePdf(inv.id);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo descargar comprobante"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="mb-3 text-2xl font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Facturación
        </h1>
        <p className="m-0 text-primaryDark/70">
          Ingresos, cobros pendientes y comprobantes del centro médico.
        </p>
      </div>

      {loading ? (
        <p className="text-primaryDark/60">Cargando datos financieros…</p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-0 text-red-700">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardCard
              title="Ingresos cobrados"
              value={formatClp(data.totalRevenueClp)}
              accentColor="#078A92"
            />
            <DashboardCard
              title="Pendientes de cobro"
              value={String(data.pendingCount)}
              accentColor="#05636B"
            />
            <DashboardCard
              title="Monto pendiente"
              value={formatClp(data.pendingAmountClp)}
              accentColor="#022C2C"
            />
            <DashboardCard
              title="Facturas pagadas"
              value={String(data.paidCount)}
              accentColor="#078A92"
            />
          </div>

          <Card className="p-5 shadow-premium">
            <h2
              className="mb-4 text-base font-bold text-primaryDark"
              style={{ fontFamily: FONT_HEADING }}
            >
              Comprobantes recientes
            </h2>
            {data.invoices.length === 0 ? (
              <p className="m-0 text-sm text-primaryDark/50">
                Aún no hay facturas registradas. Créalas desde una consulta completada.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-hd-border-subtle">
                      <th className="px-1 py-2 font-semibold text-primaryDark/60">Documento</th>
                      <th className="px-1 py-2 font-semibold text-primaryDark/60">Monto</th>
                      <th className="px-1 py-2 font-semibold text-primaryDark/60">Estado</th>
                      <th className="px-1 py-2 font-semibold text-primaryDark/60">Fecha</th>
                      <th className="px-1 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.slice(0, 50).map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-hd-border-subtle last:border-b-0"
                      >
                        <td className="px-1 py-2.5 text-primaryDark">{inv.documentNumber}</td>
                        <td className="px-1 py-2.5 text-primaryDark">{formatClp(inv.amountClp)}</td>
                        <td className="px-1 py-2.5 capitalize text-primaryDark/80">{inv.status}</td>
                        <td className="px-1 py-2.5 text-primaryDark/60">
                          {inv.issuedAt
                            ? new Date(inv.issuedAt).toLocaleDateString("es-CL")
                            : "—"}
                        </td>
                        <td className="px-1 py-2.5">
                          <button
                            type="button"
                            onClick={() => void handlePdf(inv)}
                            disabled={pdfLoadingId === inv.id}
                            className="border-0 bg-transparent p-0 text-xs font-semibold text-primary underline disabled:cursor-wait"
                          >
                            {pdfLoadingId === inv.id ? "Descargando…" : "PDF"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
}
