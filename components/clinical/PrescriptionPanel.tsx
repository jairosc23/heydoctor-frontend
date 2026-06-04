"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionPdf,
  suggestMedications,
  type MedicationItem,
  type PrescriptionRecord,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

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
  const [suggestedMeds, setSuggestedMeds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
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

  useEffect(() => {
    const q = diagnosisCode?.trim() || "par";
    if (!q) {
      setSuggestedMeds([]);
      return;
    }
    setSuggestLoading(true);
    suggestMedications(q)
      .then((list) => setSuggestedMeds(list.slice(0, 8)))
      .catch(() => setSuggestedMeds([]))
      .finally(() => setSuggestLoading(false));
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

  const addSuggested = (name: string) => {
    setDraftMeds((p) => {
      if (p.some((m) => m.name === name)) return p;
      const next = [...p];
      const emptyIdx = next.findIndex((m) => !m.name.trim());
      if (emptyIdx >= 0) next[emptyIdx] = { ...next[emptyIdx], name };
      else next.push({ name });
      return next;
    });
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
          {prescriptions.length > 0 && (
            <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
              <h4 className="text-xs font-medium text-gray-600">Recetas registradas</h4>
              {prescriptions.map((p) => (
                <div
                  key={p.id}
                  className="text-sm border border-gray-100 rounded-md p-2 flex flex-wrap items-center justify-between gap-2"
                >
                  <span className="text-gray-700">
                    {(p.medications ?? []).map((m) => m.name).filter(Boolean).join(", ")}
                    {p.diagnosis ? ` · ${p.diagnosis}` : ""}
                  </span>
                  <span className="flex gap-1 shrink-0">
                    <button type="button" onClick={() => startEdit(p)} className="text-xs text-indigo-600 hover:underline">
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void handlePdf(p.id)}
                      disabled={pdfLoadingId === p.id}
                      className="text-xs text-teal-700 hover:underline disabled:opacity-50"
                    >
                      {pdfLoadingId === p.id ? "PDF…" : "PDF"}
                    </button>
                    <button type="button" onClick={() => void handleDelete(p.id)} className="text-xs text-red-600 hover:underline">
                      Eliminar
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {suggestLoading && (
              <p className="text-xs text-gray-500">Buscando medicamentos…</p>
            )}
            {suggestedMeds.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-1">Catálogo sugerido</h4>
                <div className="flex flex-wrap gap-1">
                  {suggestedMeds.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => addSuggested(m)}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                    >
                      + {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Diagnóstico"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            {draftMeds.map((med, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-1 border border-gray-100 rounded p-2">
                <input
                  type="text"
                  value={med.name}
                  onChange={(e) => updateDraftMed(idx, { name: e.target.value })}
                  placeholder="Medicamento"
                  className="sm:col-span-2 px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={med.dosage ?? ""}
                  onChange={(e) => updateDraftMed(idx, { dosage: e.target.value })}
                  placeholder="Dosis"
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  value={med.frequency ?? ""}
                  onChange={(e) => updateDraftMed(idx, { frequency: e.target.value })}
                  placeholder="Posología"
                  className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                />
                <button
                  type="button"
                  onClick={() => removeDraftRow(idx)}
                  className="text-xs text-red-600 sm:col-span-4 text-left"
                >
                  Quitar línea
                </button>
              </div>
            ))}
            <button type="button" onClick={addDraftRow} className="text-xs text-indigo-600 hover:underline">
              + Agregar medicamento
            </button>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales"
              rows={2}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={creating}
                className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {creating ? "Guardando…" : editingId ? "Actualizar receta" : "Crear receta"}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-3 py-1.5 border border-gray-300 rounded text-sm">
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
