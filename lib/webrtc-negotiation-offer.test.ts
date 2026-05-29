import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { shouldInitiatorCreateOffer } from './webrtc-negotiation-offer';

const stable = 'stable';

describe('shouldInitiatorCreateOffer', () => {
  it('allows offer when initiator joins room with peerCount > 1 (scenario A)', () => {
    assert.equal(
      shouldInitiatorCreateOffer({
        isInitiator: true,
        peerCount: 2,
        remoteIdPresent: false,
        signalingState: stable,
        hasLocalOffer: false,
        makingOffer: false,
      }),
      true,
    );
  });

  it('allows offer on peer-joined for initiator (scenario B)', () => {
    assert.equal(
      shouldInitiatorCreateOffer({
        isInitiator: true,
        peerCount: 2,
        remoteIdPresent: true,
        signalingState: stable,
        hasLocalOffer: false,
        makingOffer: false,
      }),
      true,
    );
  });

  it('blocks non-initiator', () => {
    assert.equal(
      shouldInitiatorCreateOffer({
        isInitiator: false,
        peerCount: 2,
        remoteIdPresent: true,
        signalingState: stable,
        hasLocalOffer: false,
        makingOffer: false,
      }),
      false,
    );
  });

  it('blocks duplicate offer when local offer already set', () => {
    assert.equal(
      shouldInitiatorCreateOffer({
        isInitiator: true,
        peerCount: 2,
        remoteIdPresent: true,
        signalingState: stable,
        hasLocalOffer: true,
        makingOffer: false,
      }),
      false,
    );
  });
});
