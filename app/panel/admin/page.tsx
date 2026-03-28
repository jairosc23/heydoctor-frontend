"use client";

import MetricsDashboard from "@/components/admin/MetricsDashboard";

export default function AdminPage() {
  return (
    <div style={{ maxWidth: 960 }}>
      <h1
        style={{
          fontFamily: "Montserrat, sans-serif",
          color: "#078a92",
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 28,
        }}
      >
        Panel de Administración
      </h1>

      <MetricsDashboard />
    </div>
  );
}
