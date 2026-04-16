/**
 * Ingesta al Nest: POST /api/analytics/collect
 * Contrato: { sessionId, userId?, events: [{ event, path?, consultationId?, metadata? }] }
 */

import { getApiBase } from "./api-base";
import { HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY } from "./heydoctor-auth-constants";

const SESSION_KEY = "hd_session_id";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AnalyticsEventName =
  | "page_view"
  | "consultation_started"
  | "consultation_paid"
  | "consultation_completed";

export type TrackEventOptions = {
  event: AnalyticsEventName;
  /** Se envía como metadata (y path/query se mapean al campo `path` del evento si aplica). */
  properties?: Record<string, unknown>;
  consultationId?: string;
};

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
      sessionStorage.setItem(SESSION_KEY, sessionId.slice(0, 64));
    }
    return sessionId.slice(0, 64);
  } catch {
    return `sess-${Date.now()}`;
  }
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    return JSON.parse(atob(b64 + pad)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Solo si `sub` es UUID (validación class-validator en el API). */
function getOptionalUserId(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const token = localStorage
      .getItem(HEYDOCTOR_ACCESS_TOKEN_STORAGE_KEY)
      ?.trim();
    if (!token) return undefined;
    const payload = decodeJwtPayload(token);
    const sub = payload?.sub;
    if (typeof sub !== "string" || !UUID_RE.test(sub)) return undefined;
    return sub;
  } catch {
    return undefined;
  }
}

function optionalUuid(id: string | undefined): string | undefined {
  if (!id?.trim()) return undefined;
  return UUID_RE.test(id.trim()) ? id.trim() : undefined;
}

function pathFromProperties(
  properties?: Record<string, unknown>,
): string | undefined {
  if (!properties) return undefined;
  const p = properties.path;
  const q = properties.query;
  if (typeof p !== "string") return undefined;
  const qs = typeof q === "string" && q.length > 0 ? `?${q}` : "";
  return `${p}${qs}`.slice(0, 2048);
}

function currentDocumentPath(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return `${window.location.pathname}${window.location.search || ""}`.slice(
    0,
    2048,
  );
}

async function postCollect(
  events: Array<{
    event: AnalyticsEventName;
    path?: string;
    consultationId?: string;
    metadata?: Record<string, unknown>;
  }>,
): Promise<void> {
  if (typeof window === "undefined" || events.length === 0) return;

  const sessionId = getSessionId();
  if (!sessionId) return;

  const userId = getOptionalUserId();
  const body = JSON.stringify({
    sessionId,
    ...(userId ? { userId } : {}),
    events,
  });

  const url = `${getApiBase().replace(/\/$/, "")}/analytics/collect`;

  try {
    if (typeof navigator.sendBeacon === "function") {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
  } catch {
    /* fallback fetch */
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* no romper UX */
  }
}

/**
 * Evento genérico (p. ej. negocio). `properties` → metadata; `path`/`query` en page_view.
 */
export async function trackEvent(options: TrackEventOptions): Promise<void> {
  const props = options.properties ? { ...options.properties } : undefined;
  const pathFromProps = pathFromProperties(props);
  if (props) {
    delete props.path;
    delete props.query;
  }

  const path = pathFromProps ?? currentDocumentPath();

  const rawCid =
    options.consultationId?.trim() ??
    (typeof props?.consultationId === "string"
      ? (props.consultationId as string)
      : undefined);
  const cid = optionalUuid(rawCid);
  if (props && "consultationId" in props) {
    delete props.consultationId;
  }

  const metadata: Record<string, unknown> = props ? { ...props } : {};
  if (!cid && rawCid) {
    metadata.consultationRef = rawCid;
  }

  await postCollect([
    {
      event: options.event,
      path: path?.slice(0, 2048),
      ...(cid ? { consultationId: cid } : {}),
      ...(Object.keys(metadata).length ? { metadata } : {}),
    },
  ]);
}

export async function trackPageView(fullPath: string): Promise<void> {
  await postCollect([{ event: "page_view", path: fullPath.slice(0, 2048) }]);
}

const consultationStartedSent = new Set<string>();

/** Una vez por `consultationId` por pestaña (crear en panel + abrir detalle no duplican). */
export async function trackConsultationStartedDeduped(
  consultationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  if (consultationStartedSent.has(consultationId)) return;
  consultationStartedSent.add(consultationId);
  await trackEvent({
    event: "consultation_started",
    consultationId,
    properties: metadata,
  });
}

export async function trackConsultationStarted(
  consultationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await trackEvent({
    event: "consultation_started",
    consultationId,
    properties: metadata,
  });
}

export async function trackConsultationPaid(
  consultationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await trackEvent({
    event: "consultation_paid",
    consultationId,
    properties: metadata,
  });
}

export async function trackConsultationCompleted(
  consultationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await trackEvent({
    event: "consultation_completed",
    consultationId,
    properties: metadata,
  });
}

const TERMINAL = new Set(["completed", "signed", "locked"]);

export function isTerminalConsultationStatus(status: string | undefined): boolean {
  return status != null && TERMINAL.has(status);
}

/**
 * Si pasa de no-terminal → terminal, emite `consultation_completed` una vez por transición lógica.
 * `previous` undefined = primera hidratación (no emite completado).
 */
export function trackConsultationCompletedIfNeeded(
  previous: string | undefined,
  next: string | undefined,
  consultationId: string,
): void {
  const n = next ?? "draft";
  if (previous === undefined) return;
  if (!isTerminalConsultationStatus(n) || isTerminalConsultationStatus(previous)) {
    return;
  }
  void trackConsultationCompleted(consultationId, { status: n });
}
