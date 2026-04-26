"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConsultation } from "@/context/ConsultationContext";
import { fetchConsultation } from "@/lib/services";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

function TeleconsultaDeepLinkContent() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params?.consultationId as string;
  const { doctorId, patientId } = useConsultation();
  const isMobile = useIsMobile();
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
        setAllowed(!!(isDoctor || isPatient));
      })
      .catch(() => setAllowed(false))
      .finally(() => setLoading(false));
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

  if (isMobile) {
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
          href="/panel/consultas"
          style={{ color: "#078a92", textDecoration: "none", fontSize: 14 }}
        >
          ← Salir
        </Link>
      </div>
      <div style={{ flex: 1, padding: 20, minHeight: 0 }}>
        <TeleconsultaVideoSession
          roomId={consultationId}
          consultationId={consultationId}
          isDoctor={!!doctorId}
          onEndCall={() => router.push("/panel/consultas")}
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
