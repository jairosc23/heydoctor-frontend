"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ConsentModal } from "@/components/ConsentModal";
import { GuestNamePrompt } from "@/components/telemedicine/GuestNamePrompt";
/** Única fuente de UI de llamada: `@/components/VideoCall` (no usar alternativas duplicadas). */
import { VideoCall, type VideoCallCallChrome } from "@/components/VideoCall";
import { getGuestName, setGuestName } from "@/lib/guest-session";
import {
  CONSULTATION_ACCESS_DENIED_MESSAGE,
  getConsultationAccessErrorMessage,
} from "@/lib/consultation-access-errors";
import {
  fetchConsultation,
  fetchPublicConsultationStatus,
} from "@/lib/services";
import type { NestConsultation } from "@/lib/services/consultations";
import {
  fetchPublicTeleconsultationByToken,
  type PublicTeleconsultationInvite,
  GuestConsultationError,
} from "@/lib/services/public-consultations";
import {
  clearGuestSignalingToken,
  setGuestSignalingToken,
} from "@/lib/guest-signaling-memory";
import {
  getTelemedicineConsentStatus,
  postTelemedicineConsent,
  setTelemedicineConsent,
} from "@/lib/telemedicine-consent";
import { useAuth } from "@/lib/context/AuthContext";

/** Shell común para loaders, denegación y Suspense en rutas de teleconsulta. */
export const teleconsultaFullscreenGateShell: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  margin: 0,
  background: "#022C2C",
  color: "#E6F7F8",
  zIndex: 2147482900,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: '"Open Sans", sans-serif',
  boxSizing: "border-box",
  overflow: "hidden",
};

const gateMutedText = "m-0 text-white/60";
const gateErrorTitle =
  "m-0 mb-3 text-xl font-bold text-red-200";
const gateLink =
  "font-semibold text-primary no-underline hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primaryDark";

export type TeleconsultaPanelGate = {
  consultationId: string;
  ctxBootLoading: boolean;
};

export type TeleconsultaDeepLinkGate = {
  consultationId: string;
  doctorId?: string | null;
  patientId?: string | null;
};

export interface TeleconsultaVideoSessionProps {
  /** Sala WebRTC / signaling (obligatorio salvo durante `inviteTokenGate` antes de resolver). */
  roomId?: string;
  consultationId?: string;
  isDoctor?: boolean;
  /**
   * Si no se pasa, al colgar se usa `router.push` con `endCallGuestHref` / `endCallAuthHref`.
   */
  onEndCall?: () => void;
  /** Ruta si el usuario efectivo es invitado (solo si no hay `onEndCall`). */
  endCallGuestHref?: string;
  /** Ruta si el usuario efectivo está autenticado (solo si no hay `onEndCall`). */
  endCallAuthHref?: string;
  /**
   * `"guest"` salta la verificación de consent del médico (que requiere
   * sesión autenticada). El consent del paciente invitado ya quedó registrado
   * al crear la consulta vía `/api/public/consultations`.
   */
  mode?: "auth" | "guest";
  /** Nombre del participante remoto (p. ej. paciente) para el encabezado. */
  peerDisplayName?: string;
  /**
   * Navegación y título dentro de {@link VideoCall}. Campos omitidos se
   * rellenan según modo (panel vs invitado).
   */
  callChrome?: Partial<VideoCallCallChrome>;
  /** Verificación de acceso desde el panel (antes de montar la llamada). */
  panelGate?: TeleconsultaPanelGate;
  /** Ruta del enlace «Volver» si `panelGate` deniega acceso. */
  panelDeniedHref?: string;
  /** Validación para `/teleconsulta/[consultationId]`. */
  deepLinkGate?: TeleconsultaDeepLinkGate;
  /** Enlace en acceso denegado deep link (login). */
  deepLinkDeniedLoginHref?: string;
  /** Validación por token para `/teleconsulta/invitado/[token]`. */
  inviteTokenGate?: string;
}

/**
 * Sesión de videollamada vía signaling Nest (`/webrtc`) y {@link VideoCall}.
 * El canje de `?access_token=` lo gestiona {@link MagicLinkSessionBootstrap} a nivel de app.
 */
export function TeleconsultaVideoSession({
  roomId: roomIdProp,
  consultationId: consultationIdProp,
  onEndCall,
  endCallGuestHref = "/",
  endCallAuthHref = "/panel/consultas",
  mode = "auth",
  isDoctor = true,
  peerDisplayName,
  callChrome,
  panelGate,
  panelDeniedHref = "/panel/consultas",
  deepLinkGate,
  deepLinkDeniedLoginHref = "/login",
  inviteTokenGate,
}: TeleconsultaVideoSessionProps) {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessTokenPending = !!searchParams.get("access_token")?.trim();

  const inviteRouteActive = inviteTokenGate !== undefined;

  const [inviteLoading, setInviteLoading] = useState(
    () => inviteRouteActive && !!inviteTokenGate?.trim(),
  );
  const [inviteInvalid, setInviteInvalid] = useState(false);
  const [inviteData, setInviteData] = useState<PublicTeleconsultationInvite | null>(
    null,
  );

  const [deepLinkLoading, setDeepLinkLoading] = useState(() => !!deepLinkGate);
  const [deepLinkAllowed, setDeepLinkAllowed] = useState(() => !deepLinkGate);
  const [deepLinkIsGuest, setDeepLinkIsGuest] = useState(false);
  const [guestNameLocal, setGuestNameLocal] = useState<string | null>(null);

  const [panelPeerName, setPanelPeerName] = useState<string | undefined>();
  const [panelAccessLoading, setPanelAccessLoading] = useState(
    () => !!panelGate,
  );
  const [panelAllowed, setPanelAllowed] = useState(() => !panelGate);
  const [panelAccessMessage, setPanelAccessMessage] = useState(
    CONSULTATION_ACCESS_DENIED_MESSAGE,
  );

  const effectiveMode: "auth" | "guest" =
    inviteData != null
      ? "guest"
      : deepLinkGate != null
        ? deepLinkIsGuest
          ? "guest"
          : "auth"
        : mode;

  const effectiveIsGuest = effectiveMode === "guest";

  const handleEndCall = useCallback(() => {
    if (effectiveIsGuest) {
      clearGuestSignalingToken();
    }
    if (onEndCall) {
      onEndCall();
      return;
    }
    router.push(
      effectiveIsGuest ? endCallGuestHref : endCallAuthHref,
    );
  }, [
    onEndCall,
    router,
    effectiveIsGuest,
    endCallGuestHref,
    endCallAuthHref,
  ]);

  const [authReady, setAuthReady] = useState(
    () => mode === "guest" || inviteRouteActive,
  );
  const [consentLoading, setConsentLoading] = useState(() => mode !== "guest");
  const [consentBootstrapError, setConsentBootstrapError] = useState<
    string | null
  >(null);
  const [hasConsent, setHasConsent] = useState(() => mode === "guest");
  const [consentRetryKey, setConsentRetryKey] = useState(0);
  const [consentSubmitting, setConsentSubmitting] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);

  useEffect(() => {
    if (effectiveMode === "guest") {
      setAuthReady(true);
      setHasConsent(true);
      setConsentLoading(false);
    }
  }, [effectiveMode]);

  useEffect(() => {
    if (inviteTokenGate === undefined) {
      return;
    }
    const t = inviteTokenGate.trim();
    if (!t) {
      setInviteInvalid(true);
      setInviteLoading(false);
      return;
    }

    let cancelled = false;
    setInviteLoading(true);
    void fetchPublicTeleconsultationByToken(t)
      .then((res) => {
        if (cancelled) return;
        if (!res?.signalingToken) {
          setInviteInvalid(true);
          return;
        }
        // Guest Credential Channel (ARCH-REM-01) — never Staff access-token store.
        setGuestSignalingToken(res.signalingToken, res.consultationId);
        setInviteData(res);
      })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof GuestConsultationError && e.status === 404) {
          setInviteInvalid(true);
        } else {
          setInviteInvalid(true);
        }
      })
      .finally(() => {
        if (!cancelled) setInviteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inviteTokenGate]);

  useEffect(() => {
    if (!deepLinkGate) {
      return;
    }
    const id = deepLinkGate.consultationId?.trim();
    if (!id) {
      setDeepLinkAllowed(false);
      setDeepLinkLoading(false);
      return;
    }

    const hasSession = !!deepLinkGate.doctorId || !!deepLinkGate.patientId;
    if (hasSession && loading) {
      setDeepLinkLoading(true);
      return;
    }

    let cancelled = false;
    setDeepLinkLoading(true);

    const validateAuth = async (): Promise<boolean> => {
      try {
        const data = await fetchConsultation(id);
        const c = data as { doctorId?: string; patientId?: string };
        const docOk =
          !!deepLinkGate.doctorId && c.doctorId === deepLinkGate.doctorId;
        const patOk =
          !!deepLinkGate.patientId && c.patientId === deepLinkGate.patientId;
        return docOk || patOk;
      } catch {
        return false;
      }
    };

    const validatePublic = async (): Promise<boolean> => {
      try {
        const status = await fetchPublicConsultationStatus(id);
        if (status?.isGuest) {
          if (!cancelled) {
            setDeepLinkIsGuest(true);
            setGuestNameLocal(getGuestName(id));
          }
          return true;
        }
        return false;
      } catch {
        return false;
      }
    };

    void (async () => {
      let ok = false;
      if (hasSession) {
        ok = await validateAuth();
      }
      if (!ok) {
        ok = await validatePublic();
      }
      if (!cancelled) {
        setDeepLinkAllowed(ok);
        if (!ok) setDeepLinkIsGuest(false);
      }
      if (!cancelled) setDeepLinkLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    deepLinkGate?.consultationId,
    deepLinkGate?.doctorId,
    deepLinkGate?.patientId,
    loading,
  ]);

  useEffect(() => {
    if (!panelGate) {
      return;
    }
    const id = panelGate.consultationId?.trim();
    if (!id) {
      setPanelAllowed(false);
      setPanelAccessLoading(false);
      return;
    }
    if (loading) {
      setPanelAccessLoading(true);
      return;
    }
    if (panelGate.ctxBootLoading) {
      setPanelAccessLoading(true);
      return;
    }

    let cancelled = false;
    setPanelAccessLoading(true);
    void fetchConsultation(id)
      .then((data: NestConsultation) => {
        if (cancelled) return;
        setPanelPeerName(
          data.patient?.name?.trim() ||
            data.patient?.email?.trim() ||
            undefined,
        );
        setPanelAllowed(true);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setPanelAllowed(false);
          setPanelAccessMessage(getConsultationAccessErrorMessage(err));
        }
      })
      .finally(() => {
        if (!cancelled) setPanelAccessLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [panelGate?.consultationId, panelGate?.ctxBootLoading, loading]);

  useEffect(() => {
    if (effectiveMode === "guest") {
      setAuthReady(true);
      return;
    }
    if (accessTokenPending) {
      setAuthReady(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      await refreshUser().catch(() => {});
      if (!cancelled) {
        setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessTokenPending, effectiveMode, refreshUser]);

  useEffect(() => {
    if (effectiveMode === "guest") return;
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
  }, [authReady, consentRetryKey, effectiveMode]);

  const resolvedConsultationId =
    inviteData?.consultationId ?? consultationIdProp ?? roomIdProp ?? "";
  const resolvedRoomId =
    inviteData?.roomId ?? roomIdProp ?? consultationIdProp ?? "";

  const effectivePeerName = useMemo(() => {
    if (panelGate != null) return panelPeerName ?? peerDisplayName;
    if (
      deepLinkGate != null &&
      !!deepLinkGate.doctorId &&
      deepLinkIsGuest &&
      guestNameLocal
    ) {
      return guestNameLocal;
    }
    return peerDisplayName;
  }, [
    panelGate,
    panelPeerName,
    peerDisplayName,
    deepLinkGate,
    deepLinkGate?.doctorId,
    deepLinkIsGuest,
    guestNameLocal,
  ]);

  const resolvedCallChrome: VideoCallCallChrome = useMemo(
    () => ({
      backHref:
        callChrome?.backHref ??
        (effectiveIsGuest ? "/" : "/panel/consultas"),
      backLabel: callChrome?.backLabel ?? (effectiveIsGuest ? "Salir" : "Volver"),
      title:
        callChrome?.title ??
        (effectivePeerName?.trim()
          ? `Teleconsulta · ${effectivePeerName.trim()}`
          : "Teleconsulta"),
    }),
    [
      callChrome?.backHref,
      callChrome?.backLabel,
      callChrome?.title,
      effectiveIsGuest,
      effectivePeerName,
    ],
  );

  const effectiveIsDoctor =
    inviteData != null ? false : isDoctor;

  if (inviteTokenGate !== undefined) {
    if (inviteLoading) {
      return (
        <div style={teleconsultaFullscreenGateShell}>
          <p className={gateMutedText}>Verificando acceso…</p>
        </div>
      );
    }
    if (inviteInvalid || !inviteData) {
      return (
        <div style={teleconsultaFullscreenGateShell}>
          <p className={`w-full px-6 py-6 text-center text-base leading-relaxed ${gateMutedText}`}>
            Este enlace ya no es válido o expiró
          </p>
        </div>
      );
    }
  }

  if (deepLinkGate) {
    if (deepLinkLoading) {
      return (
        <div style={teleconsultaFullscreenGateShell}>
          <p className={gateMutedText}>Verificando acceso…</p>
        </div>
      );
    }
    if (!deepLinkAllowed) {
      return (
        <div style={teleconsultaFullscreenGateShell}>
          <div className="w-full px-6 py-6 text-center">
            <h2 className={gateErrorTitle} style={{ fontFamily: "Montserrat, sans-serif" }}>
              Acceso denegado
            </h2>
            <p className={`mb-5 leading-relaxed ${gateMutedText}`}>
              No tienes permiso para acceder a esta teleconsulta. Inicia sesión
              e intenta de nuevo.
            </p>
            <Link href={deepLinkDeniedLoginHref} className={gateLink}>
              Ir a login →
            </Link>
          </div>
        </div>
      );
    }
    if (deepLinkIsGuest && !guestNameLocal) {
      const cid = deepLinkGate.consultationId.trim();
      return (
        <div style={teleconsultaFullscreenGateShell}>
          <div
            style={{
              width: "100%",
              maxHeight: "100%",
              overflow: "auto",
              padding: 16,
              boxSizing: "border-box",
            }}
          >
            <GuestNamePrompt
              onContinue={(name) => {
                setGuestName(cid, name);
                setGuestNameLocal(name);
              }}
            />
          </div>
        </div>
      );
    }
  }

  if (panelGate && panelAccessLoading) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <p className={gateMutedText}>Verificando acceso…</p>
      </div>
    );
  }

  if (panelGate && !panelAllowed) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <div className="w-full px-6 py-6 text-center">
          <h2 className={gateErrorTitle} style={{ fontFamily: "Montserrat, sans-serif" }}>
            Acceso denegado
          </h2>
          <p className={`mb-5 leading-relaxed ${gateMutedText}`}>
            {panelAccessMessage}
          </p>
          <Link href={panelDeniedHref} className={gateLink}>
            ← Volver
          </Link>
        </div>
      </div>
    );
  }

  if (!authReady) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <p className={gateMutedText}>Preparando sesión…</p>
      </div>
    );
  }

  if (consentLoading) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <p className={gateMutedText}>
          Comprobando consentimiento…
        </p>
      </div>
    );
  }

  if (consentBootstrapError) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <div className="w-full px-6 py-6 text-center">
          <p className="mb-5 leading-relaxed text-red-200">
            {consentBootstrapError}
          </p>
          <button
            type="button"
            onClick={() => {
              setConsentBootstrapError(null);
              setConsentRetryKey((k) => k + 1);
            }}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Reintentar
          </button>
          <button
            type="button"
            onClick={handleEndCall}
            className="ml-3 rounded-lg border-0 bg-transparent px-4 py-2.5 font-medium text-white/60 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Volver
          </button>
        </div>
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
        onDecline={handleEndCall}
      />
    );
  }

  const callConsultationId = (
    resolvedRoomId ||
    resolvedConsultationId ||
    ""
  ).trim();

  if (!callConsultationId) {
    return (
      <div style={teleconsultaFullscreenGateShell}>
        <p className={gateMutedText}>Preparando sesión…</p>
      </div>
    );
  }

  if (effectiveMode === "auth") {
    if (loading) {
      return null;
    }
    if (!user) {
      return null;
    }
  }

  return (
    <div
      className="fixed inset-0 flex flex-col overflow-hidden bg-primaryDark"
      data-teleconsulta-session="active"
    >
      <VideoCall
        consultationId={callConsultationId}
        onEndCall={handleEndCall}
        isInitiator={effectiveIsDoctor}
        peerDisplayName={effectivePeerName}
        guestCall={effectiveIsGuest}
        callChrome={resolvedCallChrome}
      />
    </div>
  );
}
