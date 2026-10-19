import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createVoicePipeline } from "../pipeline";
import { attachSpeechProviderToVoicePipeline } from "./attach-to-pipeline";
import {
  createWebSpeechProvider,
  isWebSpeechApiAvailable,
  resolveWebSpeechProvider,
  type WebSpeechRecognitionLike,
} from "./index";

function createFakeRecognition(): WebSpeechRecognitionLike & {
  triggerStart: () => void;
  triggerResult: (text: string, isFinal: boolean) => void;
  triggerError: (error: string) => void;
  triggerEnd: () => void;
} {
  const fake: WebSpeechRecognitionLike & {
    triggerStart: () => void;
    triggerResult: (text: string, isFinal: boolean) => void;
    triggerError: (error: string) => void;
    triggerEnd: () => void;
  } = {
    continuous: false,
    interimResults: true,
    lang: "es-ES",
    onstart: null,
    onresult: null,
    onerror: null,
    onend: null,
    start() {
      queueMicrotask(() => fake.triggerStart());
    },
    stop() {
      queueMicrotask(() => fake.triggerEnd());
    },
    abort() {
      queueMicrotask(() => fake.triggerEnd());
    },
    triggerStart() {
      fake.onstart?.(new Event("start"));
    },
    triggerResult(text, isFinal) {
      fake.onresult?.({
        resultIndex: 0,
        results: {
          length: 1,
          0: {
            isFinal,
            length: 1,
            0: { transcript: text },
          },
        },
      });
    },
    triggerError(error) {
      fake.onerror?.({ error });
    },
    triggerEnd() {
      fake.onend?.(new Event("end"));
    },
  };
  return fake;
}

describe("isWebSpeechApiAvailable", () => {
  it("detects missing API in Node globals", () => {
    assert.equal(isWebSpeechApiAvailable({}), false);
  });

  it("detects injected SpeechRecognition constructor", () => {
    assert.equal(
      isWebSpeechApiAvailable({
        SpeechRecognition: function SpeechRecognition() {
          return createFakeRecognition();
        } as unknown as new () => WebSpeechRecognitionLike,
      }),
      true,
    );
  });
});

describe("WebSpeechProvider", () => {
  it("emits lifecycle + partial/final transcripts via injected recognition", async () => {
    const fake = createFakeRecognition();
    const provider = createWebSpeechProvider({
      recognitionFactory: () => fake,
    });

    assert.equal(provider.id, "web_speech");
    assert.equal(provider.capabilities.capturesAudio, true);
    assert.equal(provider.asTransport().kind, "web_speech");

    const types: string[] = [];
    const texts: string[] = [];
    provider.onEvent((e) => {
      types.push(e.type);
      if (e.type === "interim_transcript" || e.type === "final_transcript") {
        texts.push(e.payload.text);
      }
    });

    await provider.start({ voiceSessionId: "v-ws" });
    await Promise.resolve();
    fake.triggerResult("hola", false);
    fake.triggerResult("hola doctor", true);
    await provider.stop();
    await Promise.resolve();
    await Promise.resolve();

    assert.ok(types.includes("session_starting"));
    assert.ok(types.includes("listening_started"));
    assert.ok(types.includes("interim_transcript"));
    assert.ok(types.includes("final_transcript"));
    assert.ok(types.includes("session_completed"));
    assert.ok(texts.includes("hola"));
    assert.ok(texts.includes("hola doctor"));
  });

  it("emits cancelled on abort", async () => {
    const fake = createFakeRecognition();
    const provider = createWebSpeechProvider({
      recognitionFactory: () => fake,
    });
    const types: string[] = [];
    provider.onEvent((e) => types.push(e.type));

    await provider.start({ voiceSessionId: "v1" });
    await Promise.resolve();
    await provider.cancel("user");
    await Promise.resolve();
    await Promise.resolve();

    assert.ok(types.includes("session_cancelled"));
  });

  it("emits session_error from recognition onerror", async () => {
    const fake = createFakeRecognition();
    const provider = createWebSpeechProvider({
      recognitionFactory: () => fake,
    });
    const types: string[] = [];
    provider.onEvent((e) => types.push(e.type));

    await provider.start({ voiceSessionId: "v1" });
    await Promise.resolve();
    fake.triggerError("not-allowed");
    await Promise.resolve();

    assert.ok(types.includes("session_error"));
  });

  it("throws when creating without API and without factory", () => {
    assert.throws(
      () => createWebSpeechProvider({ scope: {} }),
      /web_speech_api_unavailable/,
    );
  });
});

describe("resolveWebSpeechProvider", () => {
  it("falls back to mock when API unavailable", () => {
    const provider = resolveWebSpeechProvider({ scope: {} });
    assert.equal(provider.id, "mock");
  });

  it("returns web_speech when recognitionFactory is provided", () => {
    const provider = resolveWebSpeechProvider({
      recognitionFactory: () => createFakeRecognition(),
    });
    assert.equal(provider.id, "web_speech");
  });
});

describe("attachSpeechProviderToVoicePipeline", () => {
  it("forwards provider events into the pipeline", async () => {
    const fake = createFakeRecognition();
    const provider = createWebSpeechProvider({
      recognitionFactory: () => fake,
    });
    const pipeline = createVoicePipeline();
    const seen: string[] = [];
    pipeline.subscribe({
      id: "test",
      onEvent: (e) => seen.push(e.type),
    });

    const detach = attachSpeechProviderToVoicePipeline(provider, pipeline);
    await provider.start({ voiceSessionId: "v1" });
    await Promise.resolve();
    fake.triggerResult("ok", true);
    await provider.stop();
    await Promise.resolve();
    await Promise.resolve();
    detach();

    assert.ok(seen.includes("session_started"));
    assert.ok(seen.includes("listening_started"));
    assert.ok(seen.includes("final_transcript"));
  });
});
