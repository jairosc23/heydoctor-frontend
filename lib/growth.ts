import { apiFetch as fetchWithCredentials } from "@/lib/api-fetch-include";
import { getApiBase } from "@/lib/api-base";
import { fetchWithAuth } from "@/lib/heydoctor-api";

export const GrowthTrackEvent = {
  VISIT_MARKETING: "VISIT_MARKETING",
  VIEW_PRICING_PAGE: "VIEW_PRICING_PAGE",
  CLICK_UPGRADE_CTA: "CLICK_UPGRADE_CTA",
  START_CHECKOUT: "START_CHECKOUT",
  PAYMENT_SUCCESS: "PAYMENT_SUCCESS",
  START_CALL: "START_CALL",
  /** Debe coincidir con GrowthFunnelEvents.FRONTEND_ERROR (events-public). */
  FRONTEND_ERROR: "FRONTEND_ERROR",
} as const;

export type GrowthTrackEventName =
  (typeof GrowthTrackEvent)[keyof typeof GrowthTrackEvent];

export type GrowthContextResponse = {
  features: Record<string, boolean>;
  experiments: Record<string, string | null>;
  userId: string | null;
};

function growthUrl(path: string): string {
  const base = getApiBase().replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

async function fetchJsonAuthed<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithAuth(path, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

async function fetchJsonPublic<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchWithCredentials(growthUrl(path), {
    ...init,
    cache: "no-store",
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

/** Identificador anónimo estable (embudo antes de login). */
export function getGrowthAnonSessionId(): string {
  if (typeof window === "undefined") return "";
  const storageKey = "heyd_growth_anon_v1";
  try {
    let value = window.localStorage.getItem(storageKey);
    if (!value || value.length < 12) {
      value =
        globalThis.crypto?.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
      window.localStorage.setItem(storageKey, value);
    }
    return value;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
  }
}

/** Solo flags públicas (usuario anónimo / rollout global). Sin cookies válidas igual responde. */
export async function fetchGrowthContextMaybeAuthed(): Promise<GrowthContextResponse | null> {
  const res = await fetchWithCredentials(growthUrl("/growth/context"), {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  return (await res.json()) as GrowthContextResponse;
}

export async function fetchGrowthContextPublic(): Promise<GrowthContextResponse> {
  return fetchJsonPublic<GrowthContextResponse>("/growth/context-public");
}

export async function fetchGrowthContextAuthed(): Promise<GrowthContextResponse> {
  return fetchJsonAuthed<GrowthContextResponse>("/growth/context");
}

export async function fetchExperimentPreview(
  experimentKey: string,
  anonId: string,
): Promise<{ variant: string | null }> {
  const query = new URLSearchParams({
    key: experimentKey,
    anonId,
  });
  const res = await fetchWithCredentials(
    `${growthUrl("/growth/experiment-preview")}?${query}`,
    {
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `experiment-preview HTTP ${res.status}: ${text.slice(0, 200)}`,
    );
  }
  return (await res.json()) as { variant: string | null };
}

/** Evento analítico de producto (requiere sesión). */
export async function trackProductEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const res = await fetchWithAuth("/growth/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, properties: properties ?? {} }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("[growth] track failed", res.status, text.slice(0, 160));
  }
}

/** Eventos permitidos sin sesión. Requiere `anonSessionId` en props. */
export async function trackProductEventPublic(
  eventName: string,
  properties: Record<string, unknown>,
): Promise<void> {
  const res = await fetchWithCredentials(growthUrl("/growth/events-public"), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, properties }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.warn("[growth] track public failed", res.status, text.slice(0, 160));
  }
}

export async function trackAuthedOrPublic(
  eventName: string,
  baseProps: Record<string, unknown>,
  anonSessionId: string,
): Promise<void> {
  const res = await fetchWithCredentials(growthUrl("/growth/events"), {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, properties: baseProps }),
  });
  if (res.ok) return;
  await trackProductEventPublic(eventName, {
    ...baseProps,
    anonSessionId,
  });
}

export type StartPricingCheckoutBody = {
  plan: "pro";
  anonSessionId: string;
  experimentKey?: string;
  variant?: string;
};

/** Checkout Payku PRO sin pasar por el panel (cookies incluidas si hay sesión). */
export async function startGrowthPricingCheckout(
  body: StartPricingCheckoutBody,
): Promise<{ checkoutUrl: string; paymentId: string }> {
  const res = await fetchWithCredentials(growthUrl("/growth/start-checkout"), {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`start-checkout HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as { checkoutUrl: string; paymentId: string };
}
