"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionPdf,
  type MedicationItem,
  type PrescriptionRecord,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  formatPrescriptionTitle,
  inferPrescriptionStatus,
  sortOrdersByStatusThenDate,
} from "@/lib/orders-command-center";
import { MedicationSuggestInput } from "./MedicationSuggestInput";
import { OrdersEmptyState } from "./orders/OrdersEmptyState";
import { UnifiedOrderCard } from "./orders/UnifiedOrderCard";

interface PrescriptionPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosisCode?: string;
  onPrescriptionCreated?: () => void;
  className?: string;
}

const emptyMed = (): MedicationItem => ({ name: "", dosage: "", frequency: "" });

export function PrescriptionPanel({
  patientId,
  consultationId,
  diagnosisCode,
  onPrescriptionCreated,
  className = "",
}: PrescriptionPanelProps) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftMeds, setDraftMeds] = useState<MedicationItem[]>([emptyMed()]);
  const [diagnosis, setDiagnosis] = useState(diagnosisCode ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);

  const reload = async () => {
    const list = await fetchPrescriptionsByPatient(patientId);
    setPrescriptions(list);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    fetchPrescriptionsByPatient(patientId)
      .then((list) => {
        if (!cancelled) setPrescriptions(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setPrescriptions([]);
          setListError(getApiErrorMessage(e, "No se pudieron cargar recetas."));
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
    setDiagnosis(diagnosisCode ?? "");
  }, [diagnosisCode]);

  const updateDraftMed = (index: number, patch: Partial<MedicationItem>) => {
    setDraftMeds((prev) =>
      prev.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    );
  };

  const addDraftRow = () => setDraftMeds((p) => [...p, emptyMed()]);

  const removeDraftRow = (index: number) => {
    setDraftMeds((p) => (p.length <= 1 ? [emptyMed()] : p.filter((_, i) => i !== index)));
  };

  const resetForm = () => {
    setEditingId(null);
    setDraftMeds([emptyMed()]);
    setNotes("");
  };

  const handleSave = async () => {
    const meds = draftMeds.filter((m) => m.name.trim());
    if (meds.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      if (editingId) {
        await updatePrescription(editingId, {
          diagnosis: diagnosis || undefined,
          medications: meds,
          notes: notes || undefined,
        });
      } else {
        await createPrescription({
          patientId,
          consultationId: consultationId ?? undefined,
          diagnosis: diagnosis || undefined,
          medications: meds,
          notes: notes || undefined,
        });
        onPrescriptionCreated?.();
      }
      resetForm();
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "Error al guardar receta"));
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (p: PrescriptionRecord) => {
    setEditingId(p.id);
    setDraftMeds(
      p.medications?.length ? [...p.medications] : [emptyMed()],
    );
    setDiagnosis(p.diagnosis ?? "");
    setNotes(p.notes ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta receta?")) return;
    setError(null);
    try {
      await deletePrescription(id);
      if (editingId === id) resetForm();
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo eliminar"));
    }
  };

  const handlePdf = async (id: string) => {
    setPdfLoadingId(id);
    setError(null);
    try {
      await downloadPrescriptionPdf(id);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo generar el PDF"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <section
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      style={{ background: "white" }}
    >
      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <span>💊</span> Recetas médicas
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando recetas...</p>
      ) : (
        <>
          {listError && (
            <p role="alert" className="text-xs mb-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
              {listError}
            </p>
          )}
          {prescriptions.length === 0 ? (
            <div className="mb-4">
              <OrdersEmptyState
                message="Sin órdenes registradas"
                actionLabel="Crear nueva receta"
                onAction={() => {
                  document
                    .getElementById("prescription-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
          ) : (
            <div className="mb-4 max-h-56 space-y-2 overflow-y-auto">
              {sortOrdersByStatusThenDate(
                prescriptions,
                (item) => inferPrescriptionStatus(item.status),
                (item) => item.createdAt,
              ).map((p) => (
                  <UnifiedOrderCard
                    key={p.id}
                    kind="Receta médica"
                    title={formatPrescriptionTitle(p)}
                    status={inferPrescriptionStatus(p.status)}
                    updatedAt={p.createdAt}
                    actions={
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(p)}
                          className="rounded font-medium text-slate-600 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
                          aria-label={`Editar receta ${formatPrescriptionTitle(p)}`}
                        >
                          Editar
                        </button>
                        <span className="text-slate-300" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          onClick={() => void handlePdf(p.id)}
                          disabled={pdfLoadingId === p.id}
                          className="rounded font-medium text-slate-600 hover:text-primary hover:underline disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
                          aria-label={`Descargar PDF de ${formatPrescriptionTitle(p)}`}
                        >
                          {pdfLoadingId === p.id ? "PDF…" : "PDF"}
                        </button>
                        <span className="text-slate-300" aria-hidden>
                          |
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleDelete(p.id)}
                          className="rounded font-medium text-slate-500 hover:text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Eliminar receta ${formatPrescriptionTitle(p)}`}
                        >
                          Eliminar
                        </button>
                      </>
                    }
                  />
                ))}
            </div>
          )}
          <div id="prescription-form" className="space-y-2">
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              aria-label="Diagnóstico de la receta"
              placeholder="Diagnóstico"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {draftMeds.map((med, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-1 border border-gray-100 rounded p-2">
                <MedicationSuggestInput
                  value={med.name}
                  onChange={(name) => updateDraftMed(idx, { name })}
                  placeholder="Medicamento"
                  className="sm:col-span-2"
                  inputClassName="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={med.dosage ?? ""}
                  onChange={(e) => updateDraftMed(idx, { dosage: e.target.value })}
                  aria-label={`Dosis del medicamento ${idx + 1}`}
                  placeholder="Dosis"
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={med.frequency ?? ""}
                  onChange={(e) => updateDraftMed(idx, { frequency: e.target.value })}
                  aria-label={`Posología del medicamento ${idx + 1}`}
                  placeholder="Posología"
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => removeDraftRow(idx)}
                  className="rounded text-xs text-red-600 sm:col-span-4 text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label={`Quitar medicamento ${idx + 1}`}
                >
                  Quitar línea
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addDraftRow}
              className="rounded text-xs text-indigo-600 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              + Agregar medicamento
            </button>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Notas generales de la receta"
              placeholder="Notas adicionales"
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={creating}
                className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                {creating ? "Guardando…" : editingId ? "Actualizar receta" : "Crear receta"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
