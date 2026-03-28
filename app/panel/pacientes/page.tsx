"use client";

import React, { useEffect, useState } from "react";
import { fetchPatients } from "@/lib/services";

export default function PacientesPage() {
  const [patients, setPatients] = useState<{ id: string; firstname?: string; lastname?: string; identification?: string }[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    fetchPatients({ search: search || undefined, limit: 50 })
      .then(({ data, total: t }) => {
        setPatients(
          Array.isArray(data)
            ? (data as {
                id: string;
                firstname?: string;
                lastname?: string;
                identification?: string;
              }[])
            : []
        );
        setTotal(t ?? 0);
      })
      .catch(() => setPatients([]))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: "#078a92",
          marginBottom: 12,
        }}
      >
        Pacientes
      </h1>
      <p style={{ color: "#666", marginBottom: 16 }}>
        Gestión de pacientes del centro.
      </p>
      <input
        type="search"
        placeholder="Buscar por nombre o identificación..."
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
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Nombre
                </th>
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Identificación
                </th>
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr
                  key={p.id}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "12px 16px" }}>
                    {[p.firstname, p.lastname].filter(Boolean).join(" ") || "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>
                    {p.identification || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <a
                      href={`/panel/consultas?patientId=${p.id}`}
                      style={{
                        color: "#078a92",
                        textDecoration: "none",
                        fontSize: 14,
                      }}
                    >
                      Iniciar consulta →
                    </a>
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
