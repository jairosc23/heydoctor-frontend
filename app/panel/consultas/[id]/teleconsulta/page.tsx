"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import { fetchConsultation } from "@/lib/services";
import type { NestConsultation } from "@/lib/services/consultations";
import { ApiError } from "@/lib/heydoctor-api";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";

export default function TeleconsultaPanelPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.id as string;
  const { doctorId, isLoading: ctxBootLoading } = useConsultation();
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

    console.log("[heydoctor] teleconsulta gate", {
      consultationId,
      doctorId: doctorId ?? null,
      ctxBootLoading,
    });

    void fetchConsultation(consultationId)
      .then((data: NestConsultation) => {
        if (cancelled) return;
        /**
         * Si GET /consultations/:id responde 200, el backend ya validó sesión
         * y pertenencia a la clínica. Evita falsos negativos por carrera de
         * `doctorId` en el contexto o consulta abierta sin `startConsultation`.
         */
        console.log("[heydoctor] teleconsulta fetchConsultation 200", {
          consultationId,
          doctorId: doctorId ?? null,
          consultationRecordId: data.id,
        });
        setAllowed(true);
      })
      .catch((error: unknown) => {
        console.error("[heydoctor] teleconsulta fetchConsultation failed", {
          consultationId,
          doctorId: doctorId ?? null,
          error,
          ...(error instanceof ApiError
            ? { status: error.status, body: error.body }
            : {}),
        });
        if (!cancelled) setAllowed(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [consultationId, ctxBootLoading]);

  useEffect(() => {
    if (allowed === true && !loading) {
      console.log("[heydoctor] teleconsulta session allowed", {
        consultationId,
        doctorId: doctorId ?? null,
        allowed: true,
      });
    }
  }, [allowed, loading, consultationId, doctorId]);

  const shellStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "#0b1120",
    zIndex: 9999,
  };

  if (loading) {
    return (
      <div style={shellStyle}>
        <div
          style={{ padding: 40, textAlign: "center", color: "#e2e8f0" }}
        >
          <p>Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div style={shellStyle}>
        <div style={{ padding: 40 }}>
          <h2 style={{ color: "#fecaca", marginBottom: 16 }}>
            Acceso denegado
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 16 }}>
            No tienes permiso para acceder a esta teleconsulta.
          </p>
          <Link
            href="/panel/consultas"
            style={{ color: "#5eead4", textDecoration: "none" }}
          >
            ← Volver a consultas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <TeleconsultaVideoSession
        roomId={consultationId}
        consultationId={consultationId}
        isDoctor={!!doctorId}
        onEndCall={() => router.push("/panel/consultas")}
      />
    </div>
  );
}
