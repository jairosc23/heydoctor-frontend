"use client";

import { useState } from "react";
import {
  downloadAuditExport,
  type AuditExportResult,
} from "@/lib/services/audit-export";

export function AuditExportPanel() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [resource, setResource] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<AuditExportResult | null>(null);

  async function onExport() {
    setBusy(true);
    setError(null);
    try {
      const result = await downloadAuditExport({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        resource: resource.trim() || undefined,
        page: 1,
        limit: 500,
      });
      setMeta(result);
      const blob = new Blob([result.csv], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        result.filename ??
        `audit-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
      setMeta(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="audit-export"
      className="mb-6 rounded-lg border border-hd-border-subtle bg-white p-4 shadow-sm"
      data-testid="audit-export-panel"
    >
      <h2 className="mb-1 text-sm font-semibold text-primaryDark">
        Audit Export (F2-06 / W5)
      </h2>
      <p className="mb-3 text-xs text-primaryDark/60">
        CSV clinic-scoped · filas inmutables · sin alterar el store de auditoría.
        Endpoint: <code className="text-[11px]">GET /api/audit/export</code>
      </p>
      <div className="mb-3 grid gap-3 sm:grid-cols-3">
        <label className="text-xs text-primaryDark/70">
          Desde (ISO date)
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 w-full rounded border border-hd-border-subtle px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-primaryDark/70">
          Hasta (ISO date)
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 w-full rounded border border-hd-border-subtle px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs text-primaryDark/70">
          Resource (opcional)
          <input
            type="text"
            value={resource}
            onChange={(e) => setResource(e.target.value)}
            placeholder="p.ej. admin_ops"
            className="mt-1 w-full rounded border border-hd-border-subtle px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <button
        type="button"
        data-testid="audit-export-download"
        disabled={busy}
        onClick={() => void onExport()}
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
      >
        {busy ? "Exportando…" : "Descargar CSV"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      {meta ? (
        <p className="mt-2 text-xs text-primaryDark/60" data-testid="audit-export-meta">
          Filas: {meta.rowCount} · total: {meta.total} · page {meta.page}/
          {meta.limit}
          {meta.truncated ? " · truncado" : ""}
        </p>
      ) : null}
    </section>
  );
}
