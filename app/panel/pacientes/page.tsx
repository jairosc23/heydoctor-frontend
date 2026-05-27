"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import { useDebouncedValue } from "@/lib/hooks/useDebouncedValue";
import { usePatientsListQuery } from "@/lib/hooks/use-panel-list-queries";
import { PATIENTS_LIST_ROOT } from "@/lib/queries/query-keys";
import { createPatient } from "@/lib/services";

interface PatientItem {
  id: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
}

export default function PacientesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 350);

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

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

  async function handleCreatePatient(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const name = formName.trim();
    const email = formEmail.trim().toLowerCase();
    if (!name || !email) {
      setFormError("Nombre y email son requeridos.");
      return;
    }
    setCreating(true);
    try {
      await createPatient({ name, email });
      setFormName("");
      setFormEmail("");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: PATIENTS_LIST_ROOT });
    } catch (err) {
      console.error("CREATE_PATIENT_FRONT_ERROR", err);
      setFormError(getApiErrorMessage(err, "Error al crear paciente"));
    } finally {
      setCreating(false);
    }
  }

  function displayName(p: PatientItem): string {
    if (p.name) return p.name;
    return [p.firstname, p.lastname].filter(Boolean).join(" ") || "—";
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

      {showForm && (
        <form
          onSubmit={handleCreatePatient}
          style={{
            background: "white",
            padding: 20,
            borderRadius: 12,
            marginBottom: 20,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 500,
          }}
        >
          <h3 style={{ margin: 0, fontSize: 16, color: "#333" }}>
            Crear paciente
          </h3>
          <input
            type="text"
            placeholder="Nombre completo"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            disabled={creating}
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          <input
            type="email"
            placeholder="Email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            disabled={creating}
            style={{
              padding: "10px 14px",
              border: "1px solid #ddd",
              borderRadius: 8,
              fontSize: 14,
            }}
          />
          {formError && (
            <p
              className="text-red-500 text-sm"
              style={{ margin: 0 }}
              role="alert"
            >
              {formError}
            </p>
          )}
          <button
            type="submit"
            disabled={creating}
            style={{
              padding: "10px 20px",
              background: "#078a92",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: creating ? "not-allowed" : "pointer",
              fontSize: 14,
              alignSelf: "flex-start",
            }}
          >
            {creating ? "Creando..." : "Crear paciente"}
          </button>
        </form>
      )}

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
                  <td style={{ padding: "12px 16px" }}>
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
