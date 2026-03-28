import { getApiBase } from "./api";

/**
 * URL base del servidor (sin `/api`). Socket.IO namespace `/webrtc` se añade en el cliente.
 * Override: NEXT_PUBLIC_WEBRTC_SIGNALING_URL=https://host
 */
export function getWebrtcSignalingBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WEBRTC_SIGNALING_URL?.replace(
    /\/$/,
    ""
  );
  if (explicit) return explicit;
  const api = getApiBase();
  const stripped = api.replace(/\/api\/?$/i, "");
  if (stripped) return stripped;
  return "https://heydoctor-backend-pro-production.up.railway.app";
}
