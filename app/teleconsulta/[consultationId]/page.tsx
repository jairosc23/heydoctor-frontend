"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import {
  fetchConsultation,
  fetchPublicConsultationStatus,
} from "@/lib/services";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

function TeleconsultaDeepLinkContent() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.consultationId as string;
  const { doctorId, patientId } = useConsultation();
  const isMobile = useIsMobile();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!consultationId) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    /**
     * Tres rutas de validación:
     * 1. **Autenticado** (doctorId o patientId presentes): pega a
     *    `/consultations/:id` autenticado y compara owners.
     * 2. **Guest** (sin sesión): pega al endpoint público
     *    `/public/consultations/:id/status` y permite acceso si el flag
     *    `isGuest` viene true (consulta creada por el flujo público).
     * 3. **Mixto** (sesión presente pero la consulta no le pertenece): si la
     *    consulta es guest también, permitirla — útil cuando un médico abre
     *    el link de un paciente sin sesión.
     */
    const hasSession = !!doctorId || !!patientId;

    const validateAuth = async (): Promise<boolean> => {
      try {
        const data = await fetchConsultation(consultationId);
        const c = data as { doctorId?: string; patientId?: string };
        const isDoctor = !!doctorId && c.doctorId === doctorId;
        const isPatient = !!patientId && c.patientId === patientId;
        return isDoctor || isPatient;
      } catch {
        return false;
      }
    };

    const validatePublic = async (): Promise<boolean> => {
      try {
        const status = await fetchPublicConsultationStatus(consultationId);
        if (status?.isGuest) {
          setIsGuest(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    (async () => {
      let ok = false;
      if (hasSession) {
        ok = await validateAuth();
      }
      if (!ok) {
        ok = await validatePublic();
      }
      setAllowed(ok);
      setLoading(false);
    })();
  }, [consultationId, doctorId, patientId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <p>Verificando acceso...</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: 40,
          fontFamily: "Open Sans",
        }}
      >
        <h2 style={{ color: "#c00", marginBottom: 16 }}>Acceso denegado</h2>
        <p style={{ color: "#666", marginBottom: 16 }}>
          No tienes permiso para acceder a esta teleconsulta. Inicia sesión e intenta de nuevo.
        </p>
        <Link
          href="/login"
          style={{ color: "#078a92", textDecoration: "none" }}
        >
          Ir a login →
        </Link>
      </div>
    );
  }

  /**
   * Para guests no podemos enviarlos al panel del médico al colgar; los
   * regresamos a la home pública.
   */
  const exitHref = isGuest ? "/" : "/panel/consultas";
  const onEndCall = () => router.push(exitHref);

  if (isMobile) {
    return (
      <TeleconsultaVideoSession
        roomId={consultationId}
        consultationId={consultationId}
        isDoctor={!!doctorId}
        onEndCall={onEndCall}
      />
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: 16,
          background: "#fff",
          borderBottom: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Link
          href={exitHref}
          style={{ color: "#078a92", textDecoration: "none", fontSize: 14 }}
        >
          ← Salir
        </Link>
        {isGuest ? (
          <span
            style={{
              fontSize: 12,
              color: "#666",
              background: "#f3f4f6",
              padding: "4px 10px",
              borderRadius: 999,
            }}
          >
            Modo invitado
          </span>
        ) : null}
      </div>
      <div style={{ flex: 1, padding: 20, minHeight: 0 }}>
        <TeleconsultaVideoSession
          roomId={consultationId}
          consultationId={consultationId}
          isDoctor={!!doctorId}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
}

export default function TeleconsultaDeepLinkPage() {
  return (
    <Suspense fallback={<p style={{ padding: 40 }}>Cargando…</p>}>
      <TeleconsultaDeepLinkContent />
    </Suspense>
  );
}
