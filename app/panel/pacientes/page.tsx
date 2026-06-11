"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePatientsListQuery } from "@/lib/hooks/use-panel-list-queries";
import { PATIENTS_LIST_ROOT } from "@/lib/queries/query-keys";
import { PatientIntakeForm } from "@/components/patients/PatientIntakeForm";
import { formatPatientAge, formatPatientDisplayName } from "@/lib/services/patients";

interface PatientItem {
  id: string;
  name?: string;
  displayName?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  age?: string | number | null;
}

export default function PacientesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [showForm, setShowForm] = useState(false);

  const patientsQuery = usePatientsListQuery({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const patients: PatientItem[] = Array.isArray(patientsQuery.data?.data)
    ? (patientsQuery.data.data as PatientItem[])
    : [];
  const total = patientsQuery.data?.total ?? 0;
  const loading = patientsQuery.isPending;
  const listError = patientsQuery.isError
    ? getApiErrorMessage(
        patientsQuery.error,
        "No se pudo cargar la lista de pacientes.",
      )
    : "";

  async function handlePatientCreated() {
    setShowForm(false);
    await queryClient.invalidateQueries({ queryKey: PATIENTS_LIST_ROOT });
  }

  function displayName(p: PatientItem): string {
    return formatPatientDisplayName(p);
  }

  return (
    <div style={{ padding: 25 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h1 style={{ fontFamily: "Montserrat", color: "#078a92", margin: 0 }}>
          Pacientes
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          style={{
            padding: "10px 20px",
            background: "#078a92",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {showForm ? "Cancelar" : "+ Nuevo paciente"}
        </button>
      </div>

      <p style={{ color: "#666", marginBottom: 16 }}>
        Gestión de pacientes del centro.
      </p>

      {listError && (
        <p className="text-red-500 text-sm" style={{ marginBottom: 12 }} role="alert">
          {listError}
        </p>
      )}

      {showForm ? (
        <PatientIntakeForm
          onSuccess={() => void handlePatientCreated()}
          onCancel={() => setShowForm(false)}
        />
      ) : null}

      <input
        type="search"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          maxWidth: 400,
          padding: "10px 14px",
          border: "1px solid #ddd",
          borderRadius: 8,
          marginBottom: 20,
          fontSize: 14,
        }}
      />

      {loading ? (
        <p style={{ color: "#666" }}>Cargando...</p>
      ) : patients.length === 0 ? (
        <p style={{ color: "#666" }}>No hay pacientes.</p>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: 12,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                <th
                  style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}
                >
                  Nombre
                </th>
                <th
                  style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}
                >
                  Email
                </th>
                <th
                  style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}
                >
                  Edad
                </th>
                <th
                  style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>{displayName(p)}</td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>
                    {p.email || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>
                    {formatPatientAge(p.age)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={() =>
                          router.push(`/panel/pacientes/${p.id}`)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#078a92",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 0,
                        }}
                      >
                        Ver ficha →
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/panel/consultas?patientId=${p.id}`)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          color: "#078a92",
                          cursor: "pointer",
                          fontSize: 14,
                          padding: 0,
                        }}
                      >
                        Nueva consulta →
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 12, color: "#999", fontSize: 13 }}>
        Total: {total}
      </p>
    </div>
  );
}
