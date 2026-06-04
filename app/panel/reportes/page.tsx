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

const BRAND = "#078a92";

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
    <div style={{ padding: 25 }}>
      <h1 style={{ fontFamily: "Montserrat", color: BRAND, marginBottom: 12 }}>
        Analytics clínicos
      </h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Dashboard ejecutivo — últimos 30 días.
      </p>

      {loading && <p style={{ color: "#888" }}>Cargando métricas…</p>}
      {error && (
        <p role="alert" style={{ color: "#991b1b", marginBottom: 16 }}>
          {error}
        </p>
      )}

      {data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 16,
              marginBottom: 28,
            }}
          >
            {[
              { label: "Pacientes totales", value: data.totalPatients },
              { label: "Pacientes nuevos (30d)", value: data.newPatients30d },
              { label: "Recurrentes (30d)", value: data.recurringPatients30d },
              { label: "Ingresos cobrados", value: formatClp(revenuePaid) },
              { label: "Ingresos pendientes", value: formatClp(revenuePending) },
            ].map((kpi) => (
              <div
                key={kpi.label}
                style={{
                  background: "white",
                  padding: 18,
                  borderRadius: 14,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ fontSize: 12, color: "#999", margin: "0 0 6px" }}>
                  {kpi.label}
                </p>
                <p style={{ fontSize: 22, fontWeight: 700, color: BRAND, margin: 0 }}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 20,
            }}
          >
            <ChartCard title="Tendencia de consultas">
              {trendData.length === 0 ? (
                <EmptyChart />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="doctor" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="consultas" fill="#07acb5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          <p style={{ fontSize: 12, color: "#aaa", marginTop: 20 }}>
            Actualizado: {new Date(data.generatedAt).toLocaleString("es-CL")}
          </p>
        </>
      )}
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
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        minHeight: 300,
      }}
    >
      <h3
        style={{
          fontFamily: "Montserrat",
          fontSize: 15,
          color: "#333",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <p style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: 40 }}>
      Sin datos en el período seleccionado.
    </p>
  );
}
