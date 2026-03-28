"use client";

import React, { useEffect, useState } from "react";
import { ConsentModal } from "@/components/ConsentModal";
import { VideoCall } from "@/components/VideoCall";
import { ensureAccessToken } from "@/lib/auth-client";
import {
  getTelemedicineConsentStatus,
  postTelemedicineConsent,
  setTelemedicineConsent,
} from "@/lib/telemedicine-consent";

export interface TeleconsultaVideoSessionProps {
  /** Mismo valor que consultationId — sala WebRTC / signaling */
  roomId: string;
  consultationId: string;
  /** Token de acceso paciente (?access_token=) si aplica */
  accessToken?: string;
  isDoctor?: boolean;
  onEndCall: () => void;
}

/**
 * Sesión de videollamada vía signaling Nest (`/webrtc`) y {@link VideoCall}.
 * El consentimiento se confirma con el backend (`GET`/`POST` consents); `localStorage` solo refleja caché.
 */
export function TeleconsultaVideoSession({
  roomId,
  consultationId,
  accessToken,
  onEndCall,
}: TeleconsultaVideoSessionProps) {
  const [authReady, setAuthReady] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [consentLoading, setConsentLoading] = useState(true);
  const [consentBootstrapError, setConsentBootstrapError] = useState<
    string | null
  >(null);
  const [hasConsent, setHasConsent] = useState(false);
  const [consentRetryKey, setConsentRetryKey] = useState(0);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const prop = accessToken?.trim();
      if (prop) return prop;
      return (await ensureAccessToken()) ?? "";
    };
    resolve().then((t) => {
      if (!cancelled) {
        setAuthToken(t);
        setAuthReady(true);
      }
    });
    return () => { cancelled = true; };
  }, [accessToken]);

  useEffect(() => {
    if (!authReady || !authToken) return;

    let cancelled = false;

    const run = async () => {
      setConsentLoading(true);
      setConsentBootstrapError(null);
      try {
        const status = await getTelemedicineConsentStatus(authToken);
        if (cancelled) return;
        setHasConsent(status.hasConsent);
        setTelemedicineConsent(status.hasConsent);
      } catch (e) {
        if (cancelled) return;
        setConsentBootstrapError(
          e instanceof Error
            ? e.message
            : "No se pudo comprobar el consentimiento."
        );
      } finally {
        if (!cancelled) setConsentLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [authReady, authToken, consentRetryKey]);

  if (!authReady) {
    return (
      <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
        Preparando sesión…
      </div>
    );
  }

  if (!authToken) {
    return (
      <div style={{ padding: 24, color: "#b91c1c" }}>
        <p>No hay sesión. Inicia sesión para usar la videollamada.</p>
        <button type="button" onClick={onEndCall} style={{ marginTop: 12 }}>
          Volver
        </button>
      </div>
    );
  }

  if (consentLoading) {
    return (
      <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
        Comprobando consentimiento…
      </div>
    );
  }

  if (consentBootstrapError) {
    return (
      <div style={{ padding: 24, maxWidth: 420, margin: "0 auto" }}>
        <p style={{ color: "#b91c1c", marginBottom: 16 }}>
          {consentBootstrapError}
        </p>
        <button
          type="button"
          onClick={() => {
            setConsentBootstrapError(null);
            setConsentRetryKey((k) => k + 1);
          }}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Reintentar
        </button>
        <button
          type="button"
          onClick={onEndCall}
          style={{
            marginLeft: 12,
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
          }}
        >
          Volver
        </button>
      </div>
    );
  }

  if (!hasConsent) {
    return (
      <ConsentModal
        isSubmitting={consentSubmitting}
        errorMessage={consentError}
        onAccept={async () => {
          setConsentError(null);
          setConsentSubmitting(true);
          try {
            await postTelemedicineConsent(authToken);
            setTelemedicineConsent(true);
            setHasConsent(true);
          } catch (e) {
            setConsentError(
              e instanceof Error
                ? e.message
                : "No se pudo registrar el consentimiento. Inténtalo de nuevo."
            );
          } finally {
            setConsentSubmitting(false);
          }
        }}
        onDecline={onEndCall}
      />
    );
  }

  return (
    <VideoCall
      consultationId={roomId || consultationId}
      authToken={authToken}
      onEndCall={onEndCall}
    />
  );
}
