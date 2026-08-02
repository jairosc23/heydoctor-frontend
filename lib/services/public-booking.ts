/**
 * Cliente público para EPIC-1 Patient Growth Loop.
 * Endpoints `/api/public/*` — sin JWT ni CSRF (credentials: omit).
 */

import { getApiBase } from "@/lib/api-base";
import {
  PAYMENT_UNAVAILABLE_USER_MESSAGE,
  sanitizePaymentApiMessage,
  toPaymentUserMessage,
} from "@/lib/payment-user-errors";

export type PublicAvailabilitySlot = {
  startsAt: string;
  endsAt: string;
  doctorId: string;
};

export type PublicSlotsResponse = {
  doctorSlug: string;
  clinicTimezone: string;
  slots: PublicAvailabilitySlot[];
};

export type PublicBookingCreated = {
  appointmentId: string;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  bookingToken: string;
  /** Portal register/claim proof — only at create, not on status. */
  portalInviteToken: string;
  checkoutPath: string;
};

export type PublicBookingStatus = {
  appointmentId: string;
  status: string;
  paymentStatus: string;
  startsAt: string;
  endsAt: string;
  telemedicineReady: boolean;
  clinicId?: string;
  bookingToken?: string;
};

export type PublicTelemedicinePrep = {
  consultationId: string;
  roomId: string;
  joinUrl: string;
  signalingToken: string;
  consentRequired: boolean;
  consentVersion: string;
  appointmentStatus: string;
  paymentStatus: string;
};

export class PublicBookingError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "PublicBookingError";
  }
}

async function parseError(res: Response): Promise<string> {
  let raw: string | string[] | undefined;
  try {
    const body = (await res.json()) as { message?: string | string[] };
    raw = body?.message;
  } catch {
    /* ignore */
  }
  // Checkout / payment endpoints: never expose provider or HTTP internals.
  if (res.url.includes("/checkout") || res.status >= 500) {
    if (raw) {
      console.error("[public-booking]", res.status, raw);
    }
    return sanitizePaymentApiMessage(raw, res.status);
  }
  if (typeof raw === "string" && raw.trim()) {
    return toPaymentUserMessage({ status: res.status, message: raw }, raw);
  }
  if (Array.isArray(raw) && raw.length > 0) {
    return toPaymentUserMessage(
      { status: res.status, message: raw.join(" · ") },
      "No se pudo completar la solicitud.",
    );
  }
  return res.status >= 500
    ? PAYMENT_UNAVAILABLE_USER_MESSAGE
    : "No se pudo completar la solicitud.";
}

export async function fetchPublicDoctorSlots(
  slug: string,
  from: string,
  to: string,
  slotMinutes = 30,
): Promise<PublicSlotsResponse> {
  const qs = new URLSearchParams({
    from,
    to,
    slotMinutes: String(slotMinutes),
  });
  const url = `${getApiBase()}/public/doctors/${encodeURIComponent(slug)}/availability/slots?${qs}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as PublicSlotsResponse;
}

export async function createPublicBooking(
  slug: string,
  body: {
    patientName: string;
    patientEmail: string;
    startsAt: string;
    endsAt: string;
    reason?: string;
    patientTimezone?: string;
    idempotencyKey?: string;
    consentVersion?: string;
  },
): Promise<PublicBookingCreated> {
  const url = `${getApiBase()}/public/doctors/${encodeURIComponent(slug)}/bookings`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as PublicBookingCreated;
}

export async function startPublicBookingCheckout(
  bookingToken: string,
): Promise<{ paymentId: string; paymentUrl: string }> {
  const url = `${getApiBase()}/public/bookings/${encodeURIComponent(bookingToken)}/checkout`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as { paymentId: string; paymentUrl: string };
}

export async function fetchPublicBookingStatus(
  bookingToken: string,
): Promise<PublicBookingStatus | null> {
  const url = `${getApiBase()}/public/bookings/${encodeURIComponent(bookingToken)}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as PublicBookingStatus;
}

export async function fetchPublicTelemedicinePrep(
  bookingToken: string,
): Promise<PublicTelemedicinePrep> {
  const url = `${getApiBase()}/public/bookings/${encodeURIComponent(bookingToken)}/telemedicine`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "GET",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as PublicTelemedicinePrep;
}

export async function mockCompletePublicCheckout(
  bookingToken: string,
): Promise<PublicBookingStatus> {
  const url = `${getApiBase()}/public/bookings/${encodeURIComponent(bookingToken)}/checkout/mock-complete`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "omit",
      headers: { Accept: "application/json" },
    });
  } catch (e) {
    throw new PublicBookingError(
      e instanceof Error
        ? `No se pudo contactar al servidor: ${e.message}`
        : "No se pudo contactar al servidor.",
      0,
    );
  }
  if (!res.ok) throw new PublicBookingError(await parseError(res), res.status);
  return (await res.json()) as PublicBookingStatus;
}
