"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConsentModal } from "@/components/ConsentModal";
import { VideoCall } from "@/components/VideoCall";
import { refreshAccessToken } from "@/lib/auth-client";
import {
  getTelemedicineConsentStatus,
  postTelemedicineConsent,
  setTelemedicineConsent,
} from "@/lib/telemedicine-consent";

export interface TeleconsultaVideoSessionProps {
  /** Mismo valor que consultationId — sala WebRTC / signaling */
  roomId: string;
  consultationId: string;
  isDoctor?: boolean;
  onEndCall: () => void;
  /**
   * `"guest"` salta la verificación de consent del médico (que requiere
   * sesión autenticada). El consent del paciente invitado ya quedó registrado
   * al crear la consulta vía `/api/public/consultations`.
   */
  mode?: "auth" | "guest";
}

/**
 * Sesión de videollamada vía signaling Nest (`/webrtc`) y {@link VideoCall}.
 * El canje de `?access_token=` lo gestiona {@link MagicLinkSessionBootstrap} a nivel de app.
 */
export function TeleconsultaVideoSession({
  roomId,
  consultationId,
  onEndCall,
  mode = "auth",
}: TeleconsultaVideoSessionProps) {
  const searchParams = useSearchParams();
  const accessTokenPending = !!searchParams.get("access_token")?.trim();
  const isGuestMode = mode === "guest";
  const [authReady, setAuthReady] = useState(isGuestMode);
  const [consentLoading, setConsentLoading] = useState(!isGuestMode);
  const [consentBootstrapError, setConsentBootstrapError] = useState<
    string | null
  >(null);
  const [hasConsent, setHasConsent] = useState(isGuestMode);
  const [consentRetryKey, setConsentRetryKey] = useState(0);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * En modo guest no hay sesión que refrescar — entramos directo al video.
     * El consent ya quedó registrado al crear la consulta pública.
     */
    if (isGuestMode) {
      setAuthReady(true);
      return;
    }
    if (accessTokenPending) {
      setAuthReady(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      await refreshAccessToken().catch(() => {});
      if (!cancelled) {
        setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessTokenPending, isGuestMode]);

  useEffect(() => {
    if (isGuestMode) return;
    if (!authReady) return;

    let cancelled = false;

    const run = async () => {
      setConsentLoading(true);
      setConsentBootstrapError(null);
      try {
        const status = await getTelemedicineConsentStatus();
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
  }, [authReady, consentRetryKey, isGuestMode]);

  if (!authReady) {
    return (
      <div style={{ padding: 24, color: "#64748b", textAlign: "center" }}>
        Preparando sesión…
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
            await postTelemedicineConsent();
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
      onEndCall={onEndCall}
    />
  );
}
