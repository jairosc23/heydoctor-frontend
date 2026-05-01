"use client";

import React, { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  TeleconsultaVideoSession,
  teleconsultaFullscreenGateShell,
} from "@/components/webrtc/TeleconsultaVideoSession";

function InvitadoTeleconsultaContent() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) ?? "";

  return (
    <TeleconsultaVideoSession
      inviteTokenGate={token}
      consultationId=""
      roomId=""
      mode="guest"
      isDoctor={false}
      onEndCall={() => router.push("/")}
    />
  );
}

export default function InvitadoTeleconsultaPage() {
  return (
    <Suspense
      fallback={
        <div style={teleconsultaFullscreenGateShell}>
          <p style={{ margin: 0, color: "#94a3b8" }}>Cargando…</p>
        </div>
      }
    >
      <InvitadoTeleconsultaContent />
    </Suspense>
  );
}
