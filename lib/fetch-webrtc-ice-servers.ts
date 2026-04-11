/**
 * ICE servers (STUN/TURN) desde el Nest. Auth: Bearer + refresh cookie vía {@link fetchWithAuth}.
 */

import { fetchWithAuth } from './api';

export type IceServersResponse = {
  iceServers: RTCIceServer[];
};

export async function fetchWebrtcIceServers(params: {
  backendOrigin: string;
  consultationId: string;
}): Promise<RTCIceServer[]> {
  const { backendOrigin, consultationId } = params;
  const url = new URL('/api/webrtc/ice-servers', backendOrigin.replace(/\/$/, ''));
  url.searchParams.set('consultationId', consultationId);

  const res = await fetchWithAuth(url.toString(), {
    method: 'GET',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `ice-servers failed: ${res.status} ${text.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as IceServersResponse;
  if (!data || !Array.isArray(data.iceServers)) {
    throw new Error('ice-servers: invalid response shape');
  }
  return data.iceServers;
}
