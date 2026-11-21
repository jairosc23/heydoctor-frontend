import assert from "node:assert/strict";
import { test } from "node:test";
import {
  UHD_HEIGHT,
  UHD_WIDTH,
  UHD_VIDEO_BITRATE_BPS,
  UHD_STABLE_SAMPLES,
  isActualUhd,
  uhdNetworkEligible,
  uhdMustDowngrade,
} from "./webrtc-uhd-video-profile";

const sample = {
  lossRatio: 0.002,
  rttMs: 40,
  availableOutgoingBitrateBps: 17_000_000,
  packetsSentInInterval: 500,
  cpuLimited: false,
};

test("UHD requires actual 3840×2160 camera output", () => {
  assert.equal(UHD_WIDTH, 3840);
  assert.equal(UHD_HEIGHT, 2160);
  assert.equal(UHD_VIDEO_BITRATE_BPS, 10_000_000);
  assert.equal(UHD_STABLE_SAMPLES, 12);
  assert.equal(isActualUhd({width:3840,height:2160}),true);
  assert.equal(isActualUhd({width:1920,height:1080}),false);
  assert.equal(isActualUhd({width:3840,height:1080}),false);
});

test("UHD does not promote without sustained measurable network headroom", () => {
  assert.equal(uhdNetworkEligible(sample),true);
  assert.equal(uhdNetworkEligible({...sample,rttMs:undefined}),false);
  assert.equal(uhdNetworkEligible({...sample,availableOutgoingBitrateBps:undefined}),false);
  assert.equal(uhdNetworkEligible({...sample,availableOutgoingBitrateBps:13_000_000}),false);
  assert.equal(uhdNetworkEligible({...sample,lossRatio:0.02}),false);
  assert.equal(uhdNetworkEligible({...sample,cpuLimited:true}),false);
  assert.equal(uhdNetworkEligible({...sample,packetsSentInInterval:0}),false);
});

test("UHD downgrades early under congestion or CPU pressure", () => {
  assert.equal(uhdMustDowngrade(sample),false);
  assert.equal(uhdMustDowngrade({...sample,lossRatio:0.021}),true);
  assert.equal(uhdMustDowngrade({...sample,rttMs:230}),true);
  assert.equal(uhdMustDowngrade({...sample,availableOutgoingBitrateBps:10_000_000}),true);
  assert.equal(uhdMustDowngrade({...sample,cpuLimited:true}),true);
});
