/**
 * Roundtrip of the legal doctor signature:
 * canvas data URL → POST /sign (raw base64) → GET /consultations/:id → img src.
 *
 * Persistence stores the payload after stripping a data-URL prefix.
 * Display must never double-prefix, and a SOAP echo must not replace a
 * signed consultation that already has a signature.
 */

const DATA_URL_MARKER = "base64,";

export function toPersistedDoctorSignature(value: string): string {
  const trimmed = value.trim();
  const idx = trimmed.indexOf(DATA_URL_MARKER);
  return idx >= 0 ? trimmed.slice(idx + DATA_URL_MARKER.length).trim() : trimmed;
}

export function doctorSignatureImageSrc(
  value: string | null | undefined,
): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("data:image/")) {
    return trimmed;
  }
  const payload = toPersistedDoctorSignature(trimmed);
  if (!payload) return null;
  return `data:image/png;base64,${payload}`;
}

export function isSignedConsultationStatus(
  status: string | null | undefined,
): boolean {
  return status === "signed" || status === "locked";
}

export function isPersistedDoctorSignatureMissing(
  status: string | null | undefined,
  signature: string | null | undefined,
): boolean {
  return (
    isSignedConsultationStatus(status) && doctorSignatureImageSrc(signature) === null
  );
}

export type ConsultationSignatureEcho = {
  status?: string;
  doctorSignature?: string | null;
  signedAt?: string | null;
};

/**
 * A SOAP PATCH echo loaded before POST /sign can return without the
 * signature. Keep the local legal-close fields instead of hydrating the wipe.
 */
export function adoptConsultationSignatureEcho<T extends ConsultationSignatureEcho>(
  local: ConsultationSignatureEcho | null | undefined,
  incoming: T,
): T {
  if (
    !local ||
    !isSignedConsultationStatus(local.status) ||
    !doctorSignatureImageSrc(local.doctorSignature)
  ) {
    return incoming;
  }
  if (doctorSignatureImageSrc(incoming.doctorSignature)) {
    return incoming;
  }
  return {
    ...incoming,
    doctorSignature: local.doctorSignature,
    signedAt: incoming.signedAt ?? local.signedAt,
    status: isSignedConsultationStatus(incoming.status)
      ? incoming.status
      : local.status,
  };
}
