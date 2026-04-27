"use client";

import React, { useEffect, useState } from "react";
import {
  fetchLabOrdersByPatient,
  createLabOrder,
  suggestLabTests,
} from "@/lib/services";
import { FALLBACK_LAB_TESTS } from "@/lib/clinical-fallbacks";

interface LabOrdersPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosisCode?: string;
  onOrderCreated?: () => void;
  className?: string;
}

export function LabOrdersPanel({
  patientId,
  consultationId,
  diagnosisCode,
  onOrderCreated,
  className = "",
}: LabOrdersPanelProps) {
  const [orders, setOrders] = useState<unknown[]>([]);
  const [suggestedTests, setSuggestedTests] = useState<string[]>([]);
  const [suggestionsAreFallback, setSuggestionsAreFallback] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [testInput, setTestInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    fetchLabOrdersByPatient(patientId)
      .then((list) => {
        if (cancelled) return;
        setOrders(list);
      })
      .catch((e) => {
        if (cancelled) return;
        if (process.env.NODE_ENV === "development") {
          console.error("[heydoctor][lab-orders] lista falló", e);
        }
        setOrders([]);
        setListError(
          e instanceof Error
            ? e.message
            : "No se pudieron cargar órdenes previas.",
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
      setSuggestedTests(FALLBACK_LAB_TESTS);
      setSuggestionsAreFallback(true);
      return;
    }
    setSuggestLoading(true);
    setSuggestionsAreFallback(false);
    suggestLabTests(diagnosisCode)
      .then((list) => {
        if (process.env.NODE_ENV === "development") {
          console.debug("[heydoctor][lab-orders] sugerencias", {
            diagnosisCode,
            count: list?.length ?? 0,
          });
        }
        if (Array.isArray(list) && list.length > 0) {
          setSuggestedTests(list);
          setSuggestionsAreFallback(false);
        } else {
          setSuggestedTests(FALLBACK_LAB_TESTS);
          setSuggestionsAreFallback(true);
        }
      })
      .catch((e) => {
        if (process.env.NODE_ENV === "development") {
          console.error("[heydoctor][lab-orders] sugerencias falló", e);
        }
        setSuggestedTests(FALLBACK_LAB_TESTS);
        setSuggestionsAreFallback(true);
      })
      .finally(() => setSuggestLoading(false));
  }, [diagnosisCode]);

  const addTest = (test: string) => {
    if (test.trim() && !selectedTests.includes(test.trim())) {
      setSelectedTests((p) => [...p, test.trim()]);
    }
  };

  const removeTest = (test: string) => {
    setSelectedTests((p) => p.filter((t) => t !== test));
  };

  const handleCreateOrder = async () => {
    const tests =
      selectedTests.length > 0 ? selectedTests : testInput.trim() ? [testInput.trim()] : [];
    if (tests.length === 0) return;
    setCreating(true);
    setError(null);
    try {
      await createLabOrder({
        patientId,
        consultationId: consultationId ?? undefined,
        lab_tests: tests,
        diagnosis_code: diagnosisCode,
      });
      setSelectedTests([]);
      setTestInput("");
      onOrderCreated?.();
      const list = await fetchLabOrdersByPatient(patientId);
      setOrders(list);
    } catch (e) {
      setError((e as Error).message ?? "Error al crear orden");
    } finally {
      setCreating(false);
    }
  };

  const orderList = Array.isArray(orders) ? orders : [];

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
            <p
              role="alert"
              className="text-xs mb-2 text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-1"
            >
              {listError}
            </p>
          )}
          {orderList.length > 0 && (
            <div className="mb-3">
              <h4 className="text-xs font-medium text-gray-600 mb-1">
                Órdenes recientes
              </h4>
              <ul className="text-sm text-gray-600 space-y-1 max-h-24 overflow-y-auto">
                {(orderList as { id?: string; lab_tests?: string[]; status?: string }[])
                  .slice(0, 5)
                  .map((o) => (
                  <li key={o.id ?? Math.random()}>
                    {(Array.isArray(o.lab_tests) ? o.lab_tests : []).join(", ")} –{" "}
                    {o.status ?? "pending"}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-2">
            {suggestedTests.length > 0 && (
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
                  {suggestedTests.slice(0, 6).map((t, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => addTest(t)}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <input
              type="text"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTest(testInput);
                }
              }}
              placeholder="Examen"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            {selectedTests.length > 0 && (
              <ul className="text-sm flex flex-wrap gap-1">
                {selectedTests.map((t) => (
                  <li
                    key={t}
                    className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {t}{" "}
                    <button
                      type="button"
                      onClick={() => removeTest(t)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={creating || (selectedTests.length === 0 && !testInput.trim())}
              className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {creating ? "Guardando..." : "Crear orden"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
