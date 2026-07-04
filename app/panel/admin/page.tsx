"use client";

import MetricsDashboard from "@/components/admin/MetricsDashboard";
import DoctorApplicationsManager from "@/components/admin/DoctorApplicationsManager";

const FONT_HEADING = "Montserrat, sans-serif";

export default function AdminPage() {
  return (
    <div className="max-w-5xl space-y-8">
      <h1
        className="mb-0 text-[26px] font-bold text-primary"
        style={{ fontFamily: FONT_HEADING }}
      >
        Panel de Administración
      </h1>

      <MetricsDashboard />

      <div>
        <DoctorApplicationsManager />
      </div>
    </div>
  );
}
