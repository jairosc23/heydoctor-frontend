import { getBackendOrigin } from "./api-base";

/**
 * URL base del servidor (sin `/api`). Socket.IO namespace `/webrtc` se añade en el cliente.
 * Override: NEXT_PUBLIC_WEBRTC_SIGNALING_URL=https://host
 * Por defecto: mismo origen que NEXT_PUBLIC_API_URL (sin sufijo /api).
 */
export function getWebrtcSignalingBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WEBRTC_SIGNALING_URL?.replace(
    /\/$/,
    ""
  );
  if (explicit) return explicit;
  return getBackendOrigin();
}
