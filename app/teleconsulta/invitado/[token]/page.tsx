"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import {
  fetchPublicTeleconsultationByToken,
  type PublicTeleconsultationInvite,
  GuestConsultationError,
} from "@/lib/services/public-consultations";

const shellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "#0b1120",
  zIndex: 9999,
};

function InvitadoTeleconsultaContent() {
  const params = useParams();
  const router = useRouter();
  const token = params?.token as string;
  const [data, setData] = useState<PublicTeleconsultationInvite | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = typeof token === "string" ? token.trim() : "";
    if (!t) {
      setInvalid(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const res = await fetchPublicTeleconsultationByToken(t);
        if (cancelled) return;
        if (!res) {
          setInvalid(true);
        } else {
          setData(res);
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof GuestConsultationError && e.status === 404) {
          setInvalid(true);
        } else {
          setInvalid(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            color: "#e2e8f0",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 22,
              fontWeight: 700,
              color: "#f8fafc",
            }}
          >
            Consulta médica en curso
          </h1>
          <p style={{ margin: 0, fontSize: 16, color: "#94a3b8" }}>
            Conectándote con tu médico...
          </p>
        </div>
      </div>
    );
  }

  if (invalid || !data) {
    return (
      <div style={shellStyle}>
        <div
          style={{
            minHeight: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            color: "#e2e8f0",
            textAlign: "center",
            boxSizing: "border-box",
          }}
        >
          <p style={{ margin: 0, fontSize: 17, maxWidth: 360, lineHeight: 1.5 }}>
            Este enlace ya no es válido o expiró
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <TeleconsultaVideoSession
        roomId={data.roomId}
        consultationId={data.consultationId}
        isDoctor={false}
        mode="guest"
        onEndCall={() => router.push("/")}
      />
    </div>
  );
}

export default function InvitadoTeleconsultaPage() {
  return (
    <Suspense
      fallback={
        <div style={shellStyle}>
          <div
            style={{
              padding: 40,
              color: "#94a3b8",
              textAlign: "center",
            }}
          >
            Cargando…
          </div>
        </div>
      }
    >
      <InvitadoTeleconsultaContent />
    </Suspense>
  );
}
