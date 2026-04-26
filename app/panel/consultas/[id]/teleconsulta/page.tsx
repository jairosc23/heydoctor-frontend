"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import { fetchConsultation } from "@/lib/services";
import { CallQualityDashboard } from "@/components/CallQualityDashboard";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";

export default function TeleconsultaPanelPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;
  const { consultationId: ctxConsultationId, doctorId, patientId } = useConsultation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!consultationId) {
      setAllowed(false);
      setLoading(false);
      return;
    }
    fetchConsultation(consultationId)
      .then((data) => {
        const c = data as { doctorId?: string; patientId?: string };
        const isDoctor = doctorId && c.doctorId === doctorId;
        const isPatient = patientId && c.patientId === patientId;
        setAllowed(!!(isDoctor || isPatient || ctxConsultationId));
      })
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
  }, [consultationId, doctorId, patientId, ctxConsultationId]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={{ padding: 40 }}>
        <h2 style={{ color: "#c00", marginBottom: 16 }}>Acceso denegado</h2>
        <p style={{ color: "#666", marginBottom: 16 }}>
          No tienes permiso para acceder a esta teleconsulta.
        </p>
        <Link
          href="/panel/consultas"
          style={{ color: "#078a92", textDecoration: "none" }}
        >
          ← Volver a consultas
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, minHeight: "calc(100vh - 100px)" }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link
          href="/panel/consultas"
          style={{ color: "#078a92", textDecoration: "none", fontSize: 14 }}
        >
          ← Volver a consulta
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(260px, 320px)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div style={{ minHeight: 360 }}>
          <TeleconsultaVideoSession
            roomId={consultationId}
            consultationId={consultationId}
            isDoctor={!!doctorId}
            onEndCall={() => router.push("/panel/consultas")}
          />
        </div>
        <CallQualityDashboard consultationId={consultationId} />
      </div>
    </div>
  );
}
