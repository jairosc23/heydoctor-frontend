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
    <TeleconsultaVideoSession
      roomId={consultationId}
      consultationId={consultationId}
      isDoctor={!!doctorId}
      onEndCall={() => router.push("/panel/consultas")}
    />
  );
}
