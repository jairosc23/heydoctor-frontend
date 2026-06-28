"use client";

import React, { useEffect, useState } from "react";
import {
  fetchLabOrdersByPatient,
  fetchLabTemplates,
  saveLabTemplate,
  createLabOrder,
  downloadLabOrderPdf,
  suggestLabTests,
  type LabExamItem,
  type LabOrderRecord,
  type LabTemplate,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  formatLabOrderTitle,
  inferLabOrderStatus,
  sortOrdersByStatusThenDate,
} from "@/lib/orders-command-center";
import { OrdersEmptyState } from "./orders/OrdersEmptyState";
import { UnifiedOrderCard } from "./orders/UnifiedOrderCard";

interface LabOrdersPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosisCode?: string;
  onOrderCreated?: () => void;
  className?: string;
}

const emptyExam = (): LabExamItem => ({
  exam: "",
  priority: "routine",
  reason: "",
  observations: "",
});

export function LabOrdersPanel({
  patientId,
  consultationId,
  diagnosisCode,
  onOrderCreated,
  className = "",
}: LabOrdersPanelProps) {
  const [orders, setOrders] = useState<LabOrderRecord[]>([]);
  const [templates, setTemplates] = useState<LabTemplate[]>([]);
  const [suggestedTests, setSuggestedTests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [exams, setExams] = useState<LabExamItem[]>([emptyExam()]);
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const reload = async () => {
    const [list, tpls] = await Promise.all([
      fetchLabOrdersByPatient(patientId),
      fetchLabTemplates(),
    ]);
    setOrders(list);
    setTemplates(tpls);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchLabOrdersByPatient(patientId), fetchLabTemplates()])
      .then(([list, tpls]) => {
        if (!cancelled) {
          setOrders(list);
          setTemplates(tpls);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setOrders([]);
          setTemplates([]);
          setListError(getApiErrorMessage(e, "No se pudieron cargar órdenes."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    const q = diagnosisCode?.trim() || "hem";
    setSuggestLoading(true);
    suggestLabTests(q)
      .then((list) => setSuggestedTests(list.slice(0, 8)))
      .catch(() => setSuggestedTests([]))
      .finally(() => setSuggestLoading(false));
  }, [diagnosisCode]);

  const updateExam = (index: number, patch: Partial<LabExamItem>) => {
    setExams((prev) => prev.map((e, i) => (i === index ? { ...e, ...patch } : e)));
  };

  const addExamRow = () => setExams((p) => [...p, emptyExam()]);

  const removeExamRow = (index: number) => {
    setExams((p) => (p.length <= 1 ? [emptyExam()] : p.filter((_, i) => i !== index)));
  };

  const addSuggested = (exam: string) => {
    setExams((p) => {
      if (p.some((e) => e.exam === exam)) return p;
      const next = [...p];
      const emptyIdx = next.findIndex((e) => !e.exam.trim());
      if (emptyIdx >= 0) next[emptyIdx] = { ...next[emptyIdx], exam };
      else next.push({ exam, priority: "routine" });
      return next;
    });
  };

  const applyTemplate = (tpl: LabTemplate) => {
    setExams(tpl.exams.length ? [...tpl.exams] : [emptyExam()]);
    setTemplateName(tpl.name);
  };

  const handleSaveTemplate = async () => {
    const valid = exams.filter((e) => e.exam.trim());
    if (!templateName.trim() || valid.length === 0) return;
    setError(null);
    try {
      await saveLabTemplate({
        name: templateName.trim(),
        exams: valid,
        isFavorite: true,
      });
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo guardar plantilla"));
    }
  };

  const handleCreateOrder = async () => {
    const valid = exams.filter((e) => e.exam.trim());
    if (valid.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      await createLabOrder({
        patientId,
        consultationId: consultationId ?? undefined,
        exams: valid,
        templateName: templateName || undefined,
      });
      setExams([emptyExam()]);
      onOrderCreated?.();
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "Error al crear orden"));
    } finally {
      setCreating(false);
    }
  };

  const handlePdf = async (id: string) => {
    setPdfLoadingId(id);
    setError(null);
    try {
      await downloadLabOrderPdf(id);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo generar el PDF"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  const favorites = templates.filter((t) => t.isFavorite);
  const others = templates.filter((t) => !t.isFavorite);

  return (
    <section
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      style={{ background: "white" }}
    >
      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <span>🧪</span> Órdenes de laboratorio
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando órdenes...</p>
      ) : (
        <>
          {listError && (
            <p role="alert" className="text-xs mb-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              {listError}
            </p>
          )}
          {orders.length === 0 ? (
            <div className="mb-3">
              <OrdersEmptyState
                message="Sin órdenes registradas"
                actionLabel="Crear nuevo laboratorio"
                onAction={() => {
                  document
                    .getElementById("lab-order-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
          ) : (
            <div className="mb-3 max-h-56 space-y-2 overflow-y-auto">
              {sortOrdersByStatusThenDate(
                orders,
                () => inferLabOrderStatus(),
                (order) => order.createdAt,
              ).map((o) => (
                  <UnifiedOrderCard
                    key={o.id}
                    kind="Laboratorio"
                    title={formatLabOrderTitle(o)}
                    status={inferLabOrderStatus()}
                    updatedAt={o.createdAt}
                    actions={
                      <button
                        type="button"
                        onClick={() => void handlePdf(o.id)}
                        disabled={pdfLoadingId === o.id}
                        className="rounded font-medium text-slate-600 hover:text-primary hover:underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
                        aria-label={`Descargar PDF de ${formatLabOrderTitle(o)}`}
                      >
                        {pdfLoadingId === o.id ? "PDF…" : "PDF"}
                      </button>
                    }
                  />
                ))}
            </div>
          )}
          {(favorites.length > 0 || others.length > 0) && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-600 mb-1">Plantillas</h4>
              <div className="flex flex-wrap gap-1">
                {[...favorites, ...others].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                      aria-label={`Aplicar plantilla ${t.name}`}
                    className={`text-xs px-2 py-1 rounded ${
                      t.isFavorite
                        ? "bg-amber-50 text-amber-800 border border-amber-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    {t.isFavorite ? "★ " : ""}
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div id="lab-order-form" className="space-y-2">
            {suggestLoading && <p className="text-xs text-gray-500">Buscando exámenes…</p>}
            {suggestedTests.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-1">Catálogo sugerido</h4>
                <div className="flex flex-wrap gap-1">
                  {suggestedTests.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => addSuggested(t)}
                      aria-label={`Agregar examen sugerido ${t}`}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {exams.map((exam, idx) => (
              <div key={idx} className="border border-gray-100 rounded p-2 space-y-1">
                <input
                  type="text"
                  value={exam.exam}
                  onChange={(e) => updateExam(idx, { exam: e.target.value })}
                  aria-label={`Nombre del examen ${idx + 1}`}
                  placeholder="Examen"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="grid grid-cols-2 gap-1">
                  <select
                    value={exam.priority ?? "routine"}
                    onChange={(e) => updateExam(idx, { priority: e.target.value })}
                    aria-label={`Prioridad del examen ${idx + 1}`}
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="routine">Rutina</option>
                    <option value="urgent">Urgente</option>
                    <option value="stat">STAT</option>
                  </select>
                  <input
                    type="text"
                    value={exam.reason ?? ""}
                    onChange={(e) => updateExam(idx, { reason: e.target.value })}
                    aria-label={`Motivo clínico del examen ${idx + 1}`}
                    placeholder="Motivo clínico"
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <input
                  type="text"
                  value={exam.observations ?? ""}
                  onChange={(e) => updateExam(idx, { observations: e.target.value })}
                  aria-label={`Observaciones del examen ${idx + 1}`}
                  placeholder="Observaciones"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeExamRow(idx)}
                  className="rounded text-xs text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Quitar examen ${idx + 1}`}
                >
                  Quitar examen
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addExamRow}
              className="rounded text-xs text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + Agregar examen
            </button>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              aria-label="Nombre de plantilla de laboratorio"
              placeholder="Nombre plantilla (opcional)"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCreateOrder()}
                disabled={creating}
                className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                {creating ? "Guardando…" : "Generar orden"}
              </button>
              <button
                type="button"
                onClick={() => void handleSaveTemplate()}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Guardar como favorita
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
