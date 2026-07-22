"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionPdf,
  type PrescriptionRecord,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  formatPrescriptionTitle,
  inferPrescriptionStatus,
  sortOrdersByStatusThenDate,
} from "@/lib/orders-command-center";
import {
  emptySelectedMedication,
  type SelectedMedication,
} from "@/lib/types/selected-medication";
import {
  medicationItemsFromSelectedMedications,
  selectedMedicationsFromMedicationItems,
} from "@/lib/prescription-composer";
import { PrescriptionComposer } from "./PrescriptionComposer";
import { OrdersEmptyState } from "./orders/OrdersEmptyState";
import { UnifiedOrderCard } from "./orders/UnifiedOrderCard";

interface PrescriptionPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosisCode?: string;
  onPrescriptionCreated?: () => void;
  className?: string;
}

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
  const [draftLines, setDraftLines] = useState<SelectedMedication[]>([
    emptySelectedMedication(),
  ]);
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

  const resetForm = () => {
    setEditingId(null);
    setDraftLines([emptySelectedMedication()]);
    setNotes("");
  };

  const handleSave = async () => {
    const meds = medicationItemsFromSelectedMedications(draftLines);
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
    setDraftLines(selectedMedicationsFromMedicationItems(p.medications));
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
      data-testid="prescription-panel"
    >
      <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-700">
        <span>💊</span> Recetas médicas
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando recetas...</p>
      ) : (
        <>
          {listError && (
            <p
              role="alert"
              className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
            >
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
                        className="rounded font-medium text-slate-600 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:opacity-50"
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

          <PrescriptionComposer
            lines={draftLines}
            onChange={setDraftLines}
            patientId={patientId}
            consultationId={consultationId}
            diagnosis={diagnosis}
            onDiagnosisChange={setDiagnosis}
            notes={notes}
            onNotesChange={setNotes}
            error={error}
            saving={creating}
            editing={Boolean(editingId)}
            onSave={() => void handleSave()}
            onCancelEdit={editingId ? resetForm : undefined}
          />
        </>
      )}
    </section>
  );
}
