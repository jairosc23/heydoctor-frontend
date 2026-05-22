"use client";

import React, { useEffect, useState } from "react";
import { fetchAppointments, type Appointment } from "@/lib/services";

function formatDateTime(value?: string, timeZone?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone,
    }).format(new Date(value));
  } catch {
    return new Date(value).toLocaleString("es-CL");
  }
}

function patientName(appointment: Appointment) {
  return (
    appointment.patient?.name ||
    [appointment.patient?.firstname, appointment.patient?.lastname]
      .filter(Boolean)
      .join(" ") ||
    "—"
  );
}

function doctorName(appointment: Appointment) {
  return (
    appointment.doctor?.name ||
    appointment.doctor?.user?.name ||
    [
      appointment.doctor?.user?.firstName,
      appointment.doctor?.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ") ||
    appointment.doctor?.email ||
    "—"
  );
}

const statusTone: Record<string, { background: string; color: string }> = {
  DRAFT: { background: "#eef2ff", color: "#3730a3" },
  PENDING_CONFIRMATION: { background: "#fff7ed", color: "#9a3412" },
  CONFIRMED: { background: "#ecfeff", color: "#0e7490" },
  CHECKED_IN: { background: "#f0fdf4", color: "#166534" },
  IN_CONSULTATION: { background: "#eff6ff", color: "#1d4ed8" },
  COMPLETED: { background: "#f8fafc", color: "#334155" },
  CANCELLED: { background: "#fef2f2", color: "#991b1b" },
  NO_SHOW: { background: "#450a0a", color: "#fee2e2" },
  REFUND_PENDING: { background: "#faf5ff", color: "#7e22ce" },
  REFUNDED: { background: "#f1f5f9", color: "#475569" },
};

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const loadAppointments = () => {
    setLoading(true);
    fetchAppointments({ limit: 50 })
      .then(({ data, total: t }) => {
        setAppointments(data);
        setTotal(t ?? 0);
        setUpdatedAt(new Date());
      })
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const items = appointments;

  return (
    <div style={{ padding: 25 }}>
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 16,
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <div>
          <h1
            style={{
              color: "#078a92",
              fontFamily: "Montserrat",
              marginBottom: 8,
            }}
          >
            Agenda
          </h1>
          <p style={{ color: "#666", margin: 0 }}>
            Calendario operacional con estados, zonas horarias y señales de
            facturación.
          </p>
        </div>
        <button
          type="button"
          onClick={loadAppointments}
          disabled={loading}
          style={{
            background: "#078a92",
            border: 0,
            borderRadius: 8,
            color: "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: 700,
            padding: "10px 14px",
          }}
        >
          Actualizar
        </button>
      </div>
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
                  Horario
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
                <th style={{ padding: "12px 16px", fontSize: 12, color: "#666" }}>
                  Operación
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <strong>
                      {formatDateTime(a.startsAt ?? a.date, a.clinicTimezone)}
                    </strong>
                    <div style={{ color: "#64748b", fontSize: 12 }}>
                      hasta {formatDateTime(a.endsAt, a.clinicTimezone)}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: 12 }}>
                      Clínica: {a.clinicTimezone ?? "—"} · Paciente:{" "}
                      {a.patientTimezone ?? "—"}
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>{patientName(a)}</td>
                  <td style={{ padding: "12px 16px", color: "#666" }}>
                    {doctorName(a)}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span
                      style={{
                        ...(statusTone[a.status ?? ""] ?? {
                          background: "#f1f5f9",
                          color: "#334155",
                        }),
                        borderRadius: 999,
                        display: "inline-block",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "5px 9px",
                      }}
                    >
                      {a.status ?? "—"}
                    </span>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13, padding: "12px 16px" }}>
                    <div>Pago: {a.paymentStatus ?? "—"}</div>
                    <div>
                      Reembolso: {a.refundEligible ? "elegible" : "no elegible"}
                    </div>
                    <div>Factura: {a.invoiceReady ? "lista" : "pendiente"}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 12, color: "#999", fontSize: 13 }}>
        Total: {total}
        {updatedAt ? ` · Actualizado ${updatedAt.toLocaleTimeString("es-CL")}` : ""}
      </p>
    </div>
  );
}
