"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  TeleconsultaVideoSession,
  teleconsultaFullscreenGateShell,
} from "@/components/webrtc/TeleconsultaVideoSession";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Guest relay lands at /teleconsulta/invitado#<bookingToken>.
 * Parse the fragment client-side so the token never reaches Next middleware,
 * server logs, redirects, or a URL path/query.
 */
export default function InvitadoTeleconsultaHashPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const candidate = window.location.hash.slice(1);
    if (!UUID_V4.test(candidate)) {
      setInvalid(true);
      return;
    }
    setToken(candidate);
  }, []);

  if (invalid) {
    return (
      <div style={teleconsultaFullscreenGateShell} role="alert">
        <p>Enlace de teleconsulta inválido.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <p>Cargando teleconsulta…</p>
      </div>
    );
  }

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
