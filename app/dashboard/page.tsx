"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";
import { getSessionUser, updateSessionUser } from "@/lib/auth";
import { fetchCurrentUser } from "@/lib/services/auth-session";
import { fetchPatients, fetchConsultations } from "@/lib/services";
import { silentCatch } from "@/lib/handle-error";

const BRAND = "#078a92";

interface DashboardStats {
  totalPatients: number;
  consultationsToday: number;
  pendingConsultations: number;
}

export default function DashboardPage() {
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    const cached = getSessionUser();
    if (cached?.plan) setPlan(cached.plan);

    let cancelled = false;
    fetchCurrentUser()
      .then((me) => {
        if (cancelled) return;
        setPlan(me.plan);
        updateSessionUser({ plan: me.plan });
      })
      .catch(silentCatch("fetchCurrentUser"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatsLoading(true);
    setStatsError(null);

    const today = new Date().toISOString().slice(0, 10);

    Promise.all([
      fetchPatients({ limit: 1 }).catch(() => ({ data: [], total: 0 })),
      fetchConsultations({ from: today, to: today, limit: 1 }).catch(() => ({
        data: [],
        total: 0,
      })),
      fetchConsultations({ status: "in_progress", limit: 1 }).catch(() => ({
        data: [],
        total: 0,
      })),
    ])
      .then(([patients, todayConsultations, pendingConsultations]) => {
        if (cancelled) return;
        setStats({
          totalPatients: patients.total,
          consultationsToday: todayConsultations.total,
          pendingConsultations: pendingConsultations.total,
        });
      })
      .catch((err) => {
        if (!cancelled)
          setStatsError(
            err instanceof Error ? err.message : "Error cargando datos"
          );
      })
      .finally(() => {
        if (!cancelled) setStatsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Pacientes totales",
      value: stats?.totalPatients ?? "—",
      color: "#07acb5",
    },
    {
      label: "Consultas hoy",
      value: stats?.consultationsToday ?? "—",
      color: "#0bb38a",
    },
    {
      label: "Consultas en curso",
      value: stats?.pendingConsultations ?? "—",
      color: "#f2a900",
    },
  ];

  return (
    <PanelLayout title="Dashboard">
      <div style={{ padding: 25 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 25,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "Montserrat",
                color: BRAND,
                marginBottom: 5,
              }}
            >
              Dashboard Clínico
            </h1>
            <p style={{ color: "#666", margin: 0 }}>
              Estado general de tu centro médico HeyDoctor
            </p>
          </div>

          {plan === "pro" && (
            <span
              style={{
                padding: "8px 18px",
                fontSize: 13,
                fontFamily: "Montserrat",
                fontWeight: 700,
                color: BRAND,
                background: "#dff7f8",
                borderRadius: 8,
                letterSpacing: "0.04em",
              }}
            >
              PRO
            </span>
          )}
        </div>

        {statsError && (
          <div
            style={{
              padding: "12px 16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: 10,
              color: "#991b1b",
              fontSize: 14,
              marginBottom: 20,
            }}
          >
            {statsError}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                background: "white",
                padding: 22,
                borderRadius: 16,
                boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
                borderLeft: `6px solid ${card.color}`,
              }}
            >
              <h3 style={{ color: "#999", marginBottom: 10 }}>{card.label}</h3>
              <p style={{ fontSize: 32, color: BRAND, margin: 0 }}>
                {statsLoading ? "…" : card.value}
              </p>
            </div>
          ))}
        </div>

        <h2
          style={{
            fontFamily: "Montserrat",
            marginTop: 40,
            color: BRAND,
          }}
        >
          Actividad Clínica
        </h2>
        <p style={{ marginTop: 20, color: "#666" }}>
          Bienvenido al panel principal de HeyDoctor.
        </p>
      </div>
    </PanelLayout>
  );
}
