"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { useConsultation } from "@/context/ConsultationContext";
import {
  TeleconsultaVideoSession,
  teleconsultaFullscreenGateShell,
} from "@/components/webrtc/TeleconsultaVideoSession";

function TeleconsultaDeepLinkContent() {
  const params = useParams();
  const consultationId = (params?.consultationId as string) ?? "";
  const { doctorId, patientId } = useConsultation();

  return (
    <TeleconsultaVideoSession
      deepLinkGate={{
        consultationId,
        doctorId,
        patientId,
      }}
      consultationId={consultationId}
      roomId={consultationId}
      isDoctor={!!doctorId}
      endCallGuestHref="/"
      endCallAuthHref="/panel/consultas"
    />
  );
}

export default function TeleconsultaDeepLinkPage() {
  return (
    <Suspense
      fallback={
        <div style={teleconsultaFullscreenGateShell}>
          <p style={{ margin: 0, color: "#94a3b8" }}>Cargando…</p>
        </div>
      }
    >
      <TeleconsultaDeepLinkContent />
    </Suspense>
  );
}
