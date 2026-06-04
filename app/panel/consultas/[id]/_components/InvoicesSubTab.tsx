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
import { cn } from "@/lib/utils";

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
      <p className="text-sm text-slate-600">
        Facturas asociadas a esta consulta. Usa las APIs de facturación clínica
        ya desplegadas.
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
      {loading ? (
        <p className="text-sm text-slate-500">Cargando facturas…</p>
      ) : invoices.length === 0 ? (
        <p className="text-sm text-slate-500">No hay facturas para esta consulta.</p>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {invoices.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-800">
                  {inv.documentNumber || inv.id.slice(0, 8)}
                </p>
                <p className="text-xs text-slate-500">
                  {inv.status} · ${inv.amountClp?.toLocaleString("es-CL")} CLP
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handlePdf(inv.id)}
                disabled={pdfLoadingId === inv.id}
                className={cn(
                  "rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primaryLight",
                  pdfLoadingId === inv.id && "opacity-60",
                )}
              >
                {pdfLoadingId === inv.id ? "PDF…" : "PDF"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
