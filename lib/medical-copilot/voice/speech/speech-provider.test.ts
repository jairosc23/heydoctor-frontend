import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SPEECH_PROVIDER_IDS,
  createDefaultSpeechProviderFactory,
  createMockSpeechProvider,
  createSpeechProviderFactory,
  createSpeechProviderRegistry,
  createStubSpeechProvider,
  seedDefaultSpeechProviderRegistry,
} from "./index";

describe("MockSpeechProvider", () => {
  it("exposes the unified SpeechProvider contract without capturing audio", async () => {
    const provider = createMockSpeechProvider({
      mockTranscript: "hola",
      emitInterim: false,
    });

    assert.equal(provider.id, "mock");
    assert.equal(provider.status, "ready");
    assert.equal(provider.capabilities.capturesAudio, false);
    assert.equal(provider.asTransport().kind, "mock");

    const types: string[] = [];
    provider.onEvent((e) => types.push(e.type));
    await provider.start({ voiceSessionId: "v1" });
    await provider.stop();

    assert.ok(types.includes("session_starting"));
    assert.ok(types.includes("session_completed"));
  });
});

describe("SpeechProviderRegistry + Factory", () => {
  it("seeds mock + web_speech as implemented; cloud vendors remain stubs", () => {
    const registry = seedDefaultSpeechProviderRegistry();
    assert.deepEqual(
      [...registry.listIds()].sort(),
      [...SPEECH_PROVIDER_IDS].sort(),
    );

    assert.equal(registry.getDescriptor("mock")?.implemented, true);
    assert.equal(registry.getDescriptor("web_speech")?.implemented, true);

    for (const id of ["openai_realtime", "deepgram", "azure_speech", "google_speech"] as const) {
      assert.equal(registry.getDescriptor(id)?.implemented, false);
    }
  });

  it("factory createDefault returns ready mock when Web Speech is unavailable", () => {
    const factory = createDefaultSpeechProviderFactory();
    const provider = factory.createDefault();
    assert.equal(provider.id, "mock");
    assert.equal(provider.status, "ready");
  });

  it("factory create(web_speech) falls back to mock when API is unavailable", () => {
    const factory = createSpeechProviderFactory();
    const provider = factory.create("web_speech");
    // Node test env has no SpeechRecognition → mock fallback.
    assert.equal(provider.id, "mock");
  });

  it("factory creates stub providers that share the same contract", async () => {
    const factory = createSpeechProviderFactory();
    const deepgram = factory.create("deepgram");

    assert.equal(deepgram.id, "deepgram");
    assert.equal(deepgram.kind, "deepgram");
    assert.equal(deepgram.status, "unconfigured");
    assert.equal(deepgram.capabilities.capturesAudio, false);

    await assert.rejects(
      () => deepgram.start({ voiceSessionId: "x" }),
      /deepgram_not_implemented/,
    );
  });

  it("supports custom registry registration", () => {
    const registry = createSpeechProviderRegistry();
    registry.register(
      {
        id: "mock",
        kind: "mock",
        displayName: "Custom Mock",
        capabilities: {
          capturesAudio: false,
          supportsStreaming: false,
          supportsInterimResults: true,
          requiresNetwork: false,
          requiresApiKey: false,
        },
        implemented: true,
      },
      () => createMockSpeechProvider({ mockTranscript: "custom" }),
    );

    const factory = createSpeechProviderFactory({ registry });
    assert.equal(factory.list().length, 1);
    assert.equal(factory.create("mock").displayName, "Mock Speech Provider");
  });

  it("throws when creating an unregistered provider", () => {
    const registry = createSpeechProviderRegistry();
    const factory = createSpeechProviderFactory({ registry });
    assert.throws(
      () => factory.create("web_speech"),
      /speech_provider_not_registered:web_speech/,
    );
  });

  it("stub asTransport mirrors SpeechProvider methods", async () => {
    const stub = createStubSpeechProvider({
      id: "azure_speech",
      kind: "azure_speech",
      displayName: "Azure Speech",
    });
    const transport = stub.asTransport();
    assert.equal(transport.capturesAudio, false);
    assert.equal(transport.kind, "azure_speech");
    await assert.rejects(() =>
      transport.start({ voiceSessionId: "s" }),
    );
  });
});
