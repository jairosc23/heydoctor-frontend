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
import { GuestNamePrompt } from "@/components/telemedicine/GuestNamePrompt";
import { getGuestName, setGuestName } from "@/lib/guest-session";

function TeleconsultaDeepLinkContent() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.consultationId as string;
  const { doctorId, patientId } = useConsultation();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  /**
   * Nombre del invitado en este dispositivo. Se hidrata desde localStorage
   * cuando se confirma que la consulta es guest. Mientras sea `null` y
   * `isGuest === true`, mostramos el prompt en lugar de la videollamada.
   */
  const [guestName, setGuestNameState] = useState<string | null>(null);

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
          /**
           * Hidratamos el nombre persistido si existe; si no, el render
           * pintará `<GuestNamePrompt>` para capturarlo.
           */
          setGuestNameState(getGuestName(consultationId));
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
          position: "fixed",
          inset: 0,
          margin: 0,
          background: "#000",
          color: "#94a3b8",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Open Sans, sans-serif",
        }}
      >
        <p style={{ margin: 0 }}>Verificando acceso…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          margin: 0,
          padding: 24,
          background: "#000",
          color: "#e2e8f0",
          fontFamily: "Open Sans, sans-serif",
          boxSizing: "border-box",
          overflow: "auto",
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
  const sessionMode: "auth" | "guest" = isGuest ? "guest" : "auth";

  /**
   * Si es guest y aún no tenemos su nombre (primer ingreso o storage limpio),
   * mostramos el prompt antes de conectar la cámara. Una vez confirmado se
   * persiste y la página re-renderiza con la videollamada visible.
   */
  if (isGuest && !guestName) {
    return (
      <GuestNamePrompt
        onContinue={(name) => {
          setGuestName(consultationId, name);
          setGuestNameState(name);
        }}
      />
    );
  }

  const sessionBlock = (
    <>
      <TeleconsultaVideoSession
        roomId={consultationId}
        consultationId={consultationId}
        isDoctor={!!doctorId}
        onEndCall={onEndCall}
        mode={sessionMode}
      />
      {isGuest && guestName ? (
        <span style={mobileGuestBadgeStyle} aria-label="Modo invitado">
          🎫 Invitado · {guestName}
        </span>
      ) : null}
    </>
  );

  return sessionBlock;
}

const mobileGuestBadgeStyle: React.CSSProperties = {
  position: "fixed",
  top: "max(env(safe-area-inset-top), 12px)",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 2147483646,
  fontSize: 11,
  fontWeight: 700,
  color: "#92400e",
  background: "rgba(254,243,199,0.92)",
  padding: "4px 12px",
  borderRadius: 999,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  maxWidth: "80vw",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

export default function TeleconsultaDeepLinkPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "#000",
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: 0,
            fontFamily: "Open Sans, sans-serif",
          }}
        >
          Cargando…
        </div>
      }
    >
      <TeleconsultaDeepLinkContent />
    </Suspense>
  );
}
