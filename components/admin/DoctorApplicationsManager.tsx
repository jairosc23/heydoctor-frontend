"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  fetchDoctorApplications,
  reviewDoctorApplication,
  type DoctorApplication,
} from "@/lib/services/doctor-applications";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#16a34a",
  rejected: "#dc2626",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

export default function DoctorApplicationsManager() {
  const [apps, setApps] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchDoctorApplications(filter || undefined);
      setApps(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleReview(id: string, decision: "approved" | "rejected") {
    setReviewingId(id);
    try {
      const reason =
        decision === "rejected" ? prompt("Razón del rechazo:") || undefined : undefined;
      await reviewDoctorApplication(id, decision, reason);
      await load();
    } catch {
      /* silent */
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 12, padding: 24, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 16, color: "#333" }}>Solicitudes de Médicos</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }}
        >
          <option value="">Todas</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobadas</option>
          <option value="rejected">Rechazadas</option>
        </select>
      </div>

      {loading ? (
        <p style={{ color: "#666", fontSize: 14 }}>Cargando...</p>
      ) : apps.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>No hay solicitudes.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {apps.map((a) => (
            <div
              key={a.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{a.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475569" }}>
                  {a.email} &middot; {a.specialty} &middot; {a.country}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
                  {new Date(a.createdAt).toLocaleDateString("es")}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "white",
                    background: STATUS_COLORS[a.status] ?? "#94a3b8",
                  }}
                >
                  {STATUS_LABELS[a.status] ?? a.status}
                </span>
                {a.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleReview(a.id, "approved")}
                      disabled={reviewingId === a.id}
                      style={{
                        padding: "6px 14px",
                        background: "#16a34a",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => handleReview(a.id, "rejected")}
                      disabled={reviewingId === a.id}
                      style={{
                        padding: "6px 14px",
                        background: "#dc2626",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
