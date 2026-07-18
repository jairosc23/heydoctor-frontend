/**
 * ICE servers (STUN/TURN) desde el Nest. Auth: Bearer + refresh cookie vía {@link fetchWithAuth}.
 */

import { fetchWithAuth } from "./heydoctor-api";

export type IceTransportPolicy = "all" | "relay";

export type TurnHygieneReport = {
  turnConfigured: boolean;
  urlCount: number;
  hasUdp: boolean;
  hasTcp: boolean;
  hasTls: boolean;
  singleTransport: boolean;
  warnings: string[];
};

export type IceServersResponse = {
  iceServers: RTCIceServer[];
  /** W2 — optional; defaults to `all` for older backends. */
  iceTransportPolicy?: IceTransportPolicy;
  turnHygiene?: TurnHygieneReport;
};

export type FetchedIceConfig = {
  iceServers: RTCIceServer[];
  iceTransportPolicy: IceTransportPolicy;
  turnHygiene: TurnHygieneReport | null;
};

export async function fetchWebrtcIceServers(params: {
  backendOrigin: string;
  consultationId: string;
}): Promise<FetchedIceConfig> {
  const { backendOrigin, consultationId } = params;
  const url = new URL(
    "/api/webrtc/ice-servers",
    backendOrigin.replace(/\/$/, ""),
  );
  url.searchParams.set("consultationId", consultationId);

  const res = await fetchWithAuth(url.toString(), {
    method: "GET",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ice-servers failed: ${res.status} ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as IceServersResponse;
  if (!data || !Array.isArray(data.iceServers)) {
    throw new Error("ice-servers: invalid response shape");
  }

  const envForceRelay =
    typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_WEBRTC_FORCE_RELAY === "1";
  const iceTransportPolicy: IceTransportPolicy =
    envForceRelay || data.iceTransportPolicy === "relay" ? "relay" : "all";

  return {
    iceServers: data.iceServers,
    iceTransportPolicy,
    turnHygiene: data.turnHygiene ?? null,
  };
}
