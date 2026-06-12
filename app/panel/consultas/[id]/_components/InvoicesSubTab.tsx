"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createInvoiceForConsultation,
  downloadInvoicePdf,
  fetchInvoiceDashboard,
  type ClinicalInvoice,
} from "@/lib/services/invoices";
import {
  generateConsultationInvoice,
  type ActionResult,
} from "@/lib/services/consultation-actions";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { useConsultationPrice } from "@/lib/hooks/useConsultationPrice";
import {
  formatInvoiceTitle,
  inferInvoiceStatus,
  sortOrdersByStatusThenDate,
} from "@/lib/orders-command-center";
import { OrdersEmptyState } from "@/components/clinical/orders/OrdersEmptyState";
import { UnifiedOrderCard } from "@/components/clinical/orders/UnifiedOrderCard";

export function InvoicesSubTab({
  consultationId,
  onLegacyInvoiceResult,
}: {
  consultationId: string;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
}) {
  const consultationPrice = useConsultationPrice();
  const [invoices, setInvoices] = useState<ClinicalInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [legacyLoading, setLegacyLoading] = useState(false);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const dash = await fetchInvoiceDashboard();
      const filtered = (dash.invoices ?? []).filter(
        (inv) => inv.consultationId === consultationId,
      );
      setInvoices(filtered);
    } catch (e) {
      setInvoices([]);
      setError(getApiErrorMessage(e, "No se pudieron cargar facturas."));
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleCreateEnterprise() {
    setCreating(true);
    setError(null);
    try {
      await createInvoiceForConsultation(
        consultationId,
        consultationPrice.amount,
      );
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo crear la factura."));
    } finally {
      setCreating(false);
    }
  }

  async function handleLegacyGenerate() {
    setLegacyLoading(true);
    const r = await generateConsultationInvoice(consultationId);
    setLegacyLoading(false);
    onLegacyInvoiceResult("Factura", r);
    if (r.status === "ok") void reload();
  }

  async function handlePdf(id: string) {
    setPdfLoadingId(id);
    try {
      await downloadInvoicePdf(id);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo descargar el PDF."));
    } finally {
      setPdfLoadingId(null);
    }
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando facturas…</p>
      ) : invoices.length === 0 ? (
        <OrdersEmptyState
          message="Sin órdenes registradas"
          actionLabel="Crear nueva factura"
          onAction={() => {
            document
              .getElementById("invoice-form")
              ?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
        />
      ) : (
        <div className="space-y-2">
          {sortOrdersByStatusThenDate(
            invoices,
            (invoice) => inferInvoiceStatus(invoice.status),
            (invoice) => invoice.issuedAt ?? invoice.paidAt,
          ).map((inv) => (
            <UnifiedOrderCard
              key={inv.id}
              kind="Factura"
              title={formatInvoiceTitle(inv)}
              status={inferInvoiceStatus(inv.status)}
              updatedAt={inv.issuedAt ?? inv.paidAt}
              actions={
                <button
                  type="button"
                  onClick={() => void handlePdf(inv.id)}
                  disabled={pdfLoadingId === inv.id}
                  className="font-medium text-slate-600 hover:text-primary hover:underline disabled:opacity-50"
                >
                  {pdfLoadingId === inv.id ? "PDF…" : "PDF"}
                </button>
              }
            />
          ))}
        </div>
      )}

      <div id="invoice-form" className="space-y-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-600">
          Facturas asociadas a esta consulta.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleCreateEnterprise()}
            disabled={creating || consultationPrice.loading}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primaryMid disabled:opacity-60"
          >
            {creating ? "Creando…" : "Crear factura (módulo clínico)"}
          </button>
          <button
            type="button"
            onClick={() => void handleLegacyGenerate()}
            disabled={legacyLoading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {legacyLoading ? "Procesando…" : "Generar factura (consulta)"}
          </button>
          <button
            type="button"
            onClick={() => void reload()}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            Actualizar
          </button>
        </div>
        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
