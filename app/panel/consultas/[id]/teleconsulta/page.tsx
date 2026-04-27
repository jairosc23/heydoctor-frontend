"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import { fetchConsultation } from "@/lib/services";
import { CallQualityDashboard } from "@/components/CallQualityDashboard";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

export default function TeleconsultaPanelPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;
  const { doctorId, isLoading: ctxBootLoading } = useConsultation();
  const isMobile = useIsMobile();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!consultationId) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    /**
     * Evita condición de carrera: `doctorId` llega después del primer render.
     * Si verificamos antes, `isDoctor` queda en falso y la videollamada no
     * arranca aunque el médico sea el titular de la consulta.
     */
    if (ctxBootLoading) {
      setLoading(true);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchConsultation(consultationId)
      .then(() => {
        if (cancelled) return;
        /**
         * Si GET /consultations/:id responde 200, el backend ya validó sesión
         * y pertenencia a la clínica. Evita falsos negativos por carrera de
         * `doctorId` en el contexto o consulta abierta sin `startConsultation`.
         */
        setAllowed(true);
      })
      .catch(() => {
        if (!cancelled) setAllowed(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [consultationId, ctxBootLoading]);

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

  if (isMobile) {
    /**
     * Mobile: el `VideoCall` interno usa `position: fixed; inset: 0; z-index:
     * 50` y cubre el sidebar/header del panel. No renderizamos chrome del
     * dashboard ni el panel de calidad; los controles flotan sobre el video.
     */
    return (
      <TeleconsultaVideoSession
        roomId={consultationId}
        consultationId={consultationId}
        isDoctor={!!doctorId}
        onEndCall={() => router.push("/panel/consultas")}
      />
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
