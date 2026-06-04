"use client";

import React, { useEffect, useState } from "react";
import {
  fetchInvoiceDashboard,
  downloadInvoicePdf,
  type InvoiceDashboard,
  type ClinicalInvoice,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

const BRAND = "#078a92";

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
    <div style={{ padding: 25 }}>
      <h1 style={{ fontFamily: "Montserrat", color: BRAND, marginBottom: 12 }}>
        Facturación
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Ingresos, cobros pendientes y comprobantes del centro médico.
      </p>

      {loading && <p style={{ color: "#888" }}>Cargando datos financieros…</p>}
      {error && (
        <p role="alert" style={{ color: "#991b1b", marginBottom: 16 }}>
          {error}
        </p>
      )}

      {data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 20,
              marginBottom: 32,
            }}
          >
            {[
              {
                label: "Ingresos cobrados",
                value: formatClp(data.totalRevenueClp),
                color: "#0bb38a",
              },
              {
                label: "Pendientes de cobro",
                value: String(data.pendingCount),
                color: "#f2a900",
              },
              {
                label: "Monto pendiente",
                value: formatClp(data.pendingAmountClp),
                color: "#e67e22",
              },
              {
                label: "Facturas pagadas",
                value: String(data.paidCount),
                color: "#07acb5",
              },
            ].map((card) => (
              <div
                key={card.label}
                style={{
                  background: "white",
                  padding: 20,
                  borderRadius: 14,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  borderLeft: `5px solid ${card.color}`,
                }}
              >
                <h3 style={{ color: "#999", marginBottom: 8, fontSize: 13 }}>
                  {card.label}
                </h3>
                <p style={{ fontSize: 24, color: BRAND, margin: 0, fontWeight: 700 }}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 20,
              boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ fontSize: 16, color: "#333", marginBottom: 16 }}>
              Comprobantes recientes
            </h2>
            {data.invoices.length === 0 ? (
              <p style={{ color: "#999", fontSize: 14 }}>
                Aún no hay facturas registradas. Créalas desde una consulta completada.
              </p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #eee", textAlign: "left" }}>
                      <th style={{ padding: "8px 4px" }}>Documento</th>
                      <th style={{ padding: "8px 4px" }}>Monto</th>
                      <th style={{ padding: "8px 4px" }}>Estado</th>
                      <th style={{ padding: "8px 4px" }}>Fecha</th>
                      <th style={{ padding: "8px 4px" }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.invoices.slice(0, 50).map((inv) => (
                      <tr key={inv.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                        <td style={{ padding: "10px 4px" }}>{inv.documentNumber}</td>
                        <td style={{ padding: "10px 4px" }}>{formatClp(inv.amountClp)}</td>
                        <td style={{ padding: "10px 4px", textTransform: "capitalize" }}>
                          {inv.status}
                        </td>
                        <td style={{ padding: "10px 4px", color: "#888" }}>
                          {inv.issuedAt
                            ? new Date(inv.issuedAt).toLocaleDateString("es-CL")
                            : "—"}
                        </td>
                        <td style={{ padding: "10px 4px" }}>
                          <button
                            type="button"
                            onClick={() => void handlePdf(inv)}
                            disabled={pdfLoadingId === inv.id}
                            style={{
                              fontSize: 12,
                              color: BRAND,
                              background: "none",
                              border: "none",
                              cursor: pdfLoadingId === inv.id ? "wait" : "pointer",
                              textDecoration: "underline",
                            }}
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
          </div>
        </>
      )}
    </div>
  );
}
