"use client";

import React, { useEffect, useState } from "react";
import { fetchAppointments } from "@/lib/services";

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<unknown[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAppointments({ limit: 50 })
      .then(({ data, total: t }) => {
        setAppointments(Array.isArray(data) ? data : []);
        setTotal(t ?? 0);
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, []);

  const items = appointments as {
    id: string;
    date?: string;
    status?: string;
    patient?: { firstname?: string; lastname?: string };
    doctor?: { user?: { firstName?: string; lastName?: string } };
  }[];

  return (
    <div style={{ padding: 25 }}>
      <h1
        style={{
          fontFamily: "Montserrat",
          color: "#078a92",
          marginBottom: 12,
        }}
      >
        Agenda
      </h1>
      <p style={{ color: "#666", marginBottom: 20 }}>
        Calendario de citas del centro.
      </p>
      {loading ? (
        <p style={{ color: "#666" }}>Cargando...</p>
      ) : items.length === 0 ? (
        <p style={{ color: "#666" }}>No hay citas programadas.</p>
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
                  Fecha
                </th>
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Paciente
                </th>
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Doctor
                </th>
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    {a.date
                      ? new Date(a.date).toLocaleString("es")
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {a.patient
                      ? [a.patient.firstname, a.patient.lastname]
                          .filter(Boolean)
                          .join(" ")
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>
                    {a.doctor?.user
                      ? [a.doctor.user.firstName, a.doctor.user.lastName]
                          .filter(Boolean)
                          .join(" ")
                      : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>{a.status ?? "—"}</td>
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
