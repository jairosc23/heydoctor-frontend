"use client";

import { useEffect, useState } from "react";
import PanelLayout from "@/components/PanelLayout";
import DashboardCard from "@/components/ui/DashboardCard";
import { useAuth } from "@/lib/context/AuthContext";
import { fetchPatients, fetchConsultations } from "@/lib/services";

interface DashboardStats {
  totalPatients: number;
  consultationsToday: number;
  pendingConsultations: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const plan = user?.plan ?? null;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

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
            err instanceof Error ? err.message : "Error cargando datos",
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
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="mb-1 text-2xl font-bold text-primary"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              Dashboard Clínico
            </h1>
            <p className="m-0 text-gray-600">
              Estado general de tu centro médico HeyDoctor
            </p>
          </div>

          {plan === "pro" && (
            <span
              className="rounded-lg bg-primaryLight px-4 py-2 text-xs font-bold tracking-wide text-primary"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              PRO
            </span>
          )}
        </div>

        {statsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {statsError}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card) => (
            <DashboardCard
              key={card.label}
              title={card.label}
              value={statsLoading ? "…" : card.value}
              accentColor={card.color}
            />
          ))}
        </div>

        <h2
          className="mt-10 text-xl font-bold text-primary"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          Actividad Clínica
        </h2>
        <p className="text-gray-600">Bienvenido al panel principal de HeyDoctor.</p>
      </div>
    </PanelLayout>
  );
}
