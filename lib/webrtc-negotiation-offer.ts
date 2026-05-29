/**
 * Predicado puro para decidir si el iniciador debe crear offer inicial.
 */

export function shouldInitiatorCreateOffer(params: {
  isInitiator: boolean;
  peerCount: number;
  remoteIdPresent: boolean;
  signalingState: string;
  hasLocalOffer: boolean;
  makingOffer: boolean;
}): boolean {
  if (!params.isInitiator) return false;
  if (params.makingOffer) return false;
  if (params.signalingState !== 'stable') return false;
  if (params.hasLocalOffer) return false;
  if (!params.remoteIdPresent && params.peerCount <= 1) return false;
  return true;
}
