/**
 * ICE servers for WebRTC (TURN/STUN).
 * Uses NEXT_PUBLIC_ICE_SERVERS_URL or falls back to {getApiBase()}/webrtc/ice-servers.
 */

import { fetchWithAuth, getApiBase } from "../api";

function resolveIceServersUrl(): string {
  const fromEnv =
    typeof process !== "undefined"
      ? (process as { env?: { NEXT_PUBLIC_ICE_SERVERS_URL?: string } }).env
          ?.NEXT_PUBLIC_ICE_SERVERS_URL?.trim()
      : undefined;
  if (fromEnv) return fromEnv;
  return `${getApiBase().replace(/\/$/, "")}/webrtc/ice-servers`;
}

export interface RTCIceServer {
  urls: string | string[];
  username?: string;
  credential?: string;
}

const FALLBACK_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
];

export async function fetchIceServers(): Promise<RTCIceServer[]> {
  try {
    const res = await fetchWithAuth(resolveIceServersUrl());
    if (!res.ok) return FALLBACK_SERVERS;
    const data = (await res.json()) as { iceServers?: RTCIceServer[] };
    return data?.iceServers?.length ? data.iceServers : FALLBACK_SERVERS;
  } catch {
    return FALLBACK_SERVERS;
  }
}
