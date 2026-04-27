"use client";

import React, { useEffect, useState } from "react";
import {
  fetchPrescriptionsByPatient,
  createPrescription,
  suggestMedications,
} from "@/lib/services";
import { FALLBACK_MEDICATIONS } from "@/lib/clinical-fallbacks";

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
  const [prescriptions, setPrescriptions] = useState<unknown[]>([]);
  const [suggestedMeds, setSuggestedMeds] = useState<string[]>([]);
  const [suggestionsAreFallback, setSuggestionsAreFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [medInput, setMedInput] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    fetchPrescriptionsByPatient(patientId)
      .then((list) => {
        if (cancelled) return;
        setPrescriptions(list);
      })
      .catch((e) => {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          console.error("[heydoctor][prescriptions] lista falló", e);
        }
        setPrescriptions([]);
        setListError(
          e instanceof Error
            ? e.message
            : "No se pudieron cargar recetas previas.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (!diagnosisCode) {
      setSuggestedMeds(FALLBACK_MEDICATIONS);
      setSuggestionsAreFallback(true);
      return;
    }
    setSuggestLoading(true);
    setSuggestionsAreFallback(false);
    suggestMedications(diagnosisCode)
      .then((list) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[heydoctor][prescriptions] sugerencias", {
            diagnosisCode,
            count: list?.length ?? 0,
          });
        }
        if (Array.isArray(list) && list.length > 0) {
          setSuggestedMeds(list);
          setSuggestionsAreFallback(false);
        } else {
          setSuggestedMeds(FALLBACK_MEDICATIONS);
          setSuggestionsAreFallback(true);
        }
      })
      .catch((e) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[heydoctor][prescriptions] sugerencias falló", e);
        }
        setSuggestedMeds(FALLBACK_MEDICATIONS);
        setSuggestionsAreFallback(true);
      })
      .finally(() => setSuggestLoading(false));
  }, [diagnosisCode]);

  const addMedication = (name: string) => {
    if (name.trim() && !medications.includes(name.trim())) {
      setMedications((p) => [...p, name.trim()]);
    }
  };

  const removeMedication = (name: string) => {
    setMedications((p) => p.filter((m) => m !== name));
  };

  const handleCreatePrescription = async () => {
    const meds =
      medications.length > 0 ? medications : medInput.trim() ? [medInput.trim()] : [];
    if (meds.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      await createPrescription({
        patientId,
        consultationId: consultationId ?? undefined,
        medications: meds.map((name) => ({ name })),
        dosage: dosage || undefined,
        instructions: instructions || undefined,
      });
      setMedications([]);
      setMedInput("");
      setDosage("");
      setInstructions("");
      onPrescriptionCreated?.();
      const list = await fetchPrescriptionsByPatient(patientId);
      setPrescriptions(list);
    } catch (e) {
      setError((e as Error).message ?? "Error al crear receta");
    } finally {
      setCreating(false);
    }
  };

  const prescriptionList = Array.isArray(prescriptions) ? prescriptions : [];

  return (
    <section
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      style={{ background: "white" }}
    >
      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <span>💊</span> Recetas
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando recetas...</p>
      ) : (
        <>
          {listError && (
            <p
              role="alert"
              className="text-xs mb-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1"
            >
              {listError}
            </p>
          )}
          {prescriptionList.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-600 mb-1">
                Recetas recientes
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 max-h-20 overflow-y-auto">
                {(prescriptionList as { id?: string; medications?: unknown[] }[])
                  .slice(0, 3)
                  .map((p) => (
                  <li key={p.id ?? Math.random()}>
                    {(Array.isArray(p.medications) ? p.medications : [])
                      .map((m: unknown) =>
                        typeof m === "string" ? m : (m as { name?: string })?.name
                      )
                      .filter(Boolean)
                      .join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            {suggestedMeds.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  Sugeridos {diagnosisCode ? "(por diagnóstico)" : ""}
                  {suggestionsAreFallback && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-normal"
                      title="Sugerencias de muestra mientras el catálogo backend no está disponible."
                    >
                      demo
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {suggestedMeds.slice(0, 6).map((m, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addMedication(m)}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                    >
                      + {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <input
                type="text"
                value={medInput}
                onChange={(e) => setMedInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMedication(medInput);
                  }
                }}
                placeholder="Medicamento"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-1"
              />
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Dosis"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm mb-1"
              />
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Instrucciones"
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
              />
            </div>
            {medications.length > 0 && (
              <ul className="text-sm flex flex-wrap gap-1">
                {medications.map((m) => (
                  <li
                    key={m}
                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {m}{" "}
                    <button
                      type="button"
                      onClick={() => removeMedication(m)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <button
              type="button"
              onClick={handleCreatePrescription}
              disabled={creating || (medications.length === 0 && !medInput.trim())}
              className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {creating ? "Guardando..." : "Crear receta"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
