"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  fetchExecutiveDashboard,
  type ExecutiveDashboard,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import Card from "@/components/ui/Card";
import DashboardCard from "@/components/ui/DashboardCard";

const FONT_HEADING = "Montserrat, sans-serif";
const BRAND = "#078A92";

function formatClp(n: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ReportesPage() {
  const [data, setData] = useState<ExecutiveDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchExecutiveDashboard()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(getApiErrorMessage(e, "No se pudieron cargar métricas"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const trendData = useMemo(
    () =>
      (data?.consultationsByDay ?? []).map((row) => ({
        day: new Date(row.day).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "short",
        }),
        consultas: row.count,
      })),
    [data],
  );

  const doctorData = useMemo(
    () =>
      (data?.consultationsByDoctor ?? []).map((row) => ({
        doctor: row.doctor_id.slice(0, 8),
        consultas: row.count,
      })),
    [data],
  );

  const revenuePaid = data?.revenue?.revenue_paid ?? 0;
  const revenuePending = data?.revenue?.revenue_pending ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="mb-3 text-2xl font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Analytics clínicos
        </h1>
        <p className="m-0 text-primaryDark/70">
          Dashboard ejecutivo — últimos 30 días.
        </p>
      </div>

      {loading ? (
        <p className="text-primaryDark/60">Cargando métricas…</p>
      ) : null}
      {error ? (
        <p role="alert" className="mb-0 text-red-700">
          {error}
        </p>
      ) : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <DashboardCard title="Pacientes totales" value={data.totalPatients} />
            <DashboardCard title="Pacientes nuevos (30d)" value={data.newPatients30d} />
            <DashboardCard title="Recurrentes (30d)" value={data.recurringPatients30d} />
            <DashboardCard title="Ingresos cobrados" value={formatClp(revenuePaid)} />
            <DashboardCard title="Ingresos pendientes" value={formatClp(revenuePending)} />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ChartCard title="Tendencia de consultas">
              {trendData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="consultas"
                      stroke={BRAND}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Consultas por médico">
              {doctorData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={doctorData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8EEF0" />
                    <XAxis dataKey="doctor" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="consultas" fill={BRAND} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <p className="text-xs text-primaryDark/50">
            Actualizado: {new Date(data.generatedAt).toLocaleString("es-CL")}
          </p>
        </>
      ) : null}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="min-h-[300px] p-5 shadow-premium">
      <h3
        className="mb-3 text-[15px] font-bold text-primaryDark"
        style={{ fontFamily: FONT_HEADING }}
      >
        {title}
      </h3>
      {children}
    </Card>
  );
}

function EmptyChart() {
  return (
    <p className="p-10 text-center text-[13px] text-primaryDark/40">
      Sin datos en el período seleccionado.
    </p>
  );
}
