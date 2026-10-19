import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMockSpeechProvider } from "../voice/speech/mock-speech-provider";
import {
  applyFinalTranscript,
  applyPartialTranscript,
  clearDictationBuffer,
  createClinicalDictationService,
  createEmptyDictationBuffer,
  setDictationDraft,
} from "./index";

describe("DictationBuffer", () => {
  it("applies partial and final transcripts in memory only", () => {
    let buffer = createEmptyDictationBuffer();
    buffer = applyPartialTranscript(buffer, "dolor");
    assert.equal(buffer.partial, "dolor");
    assert.equal(buffer.draft, "dolor");

    buffer = applyFinalTranscript(buffer, "dolor torácico");
    assert.equal(buffer.partial, null);
    assert.equal(buffer.committed, "dolor torácico");
    assert.equal(buffer.draft, "dolor torácico");

    buffer = setDictationDraft(buffer, "dolor torácico opresivo");
    assert.equal(buffer.draft, "dolor torácico opresivo");

    buffer = clearDictationBuffer();
    assert.equal(buffer.draft, "");
    assert.equal(buffer.committed, "");
  });

  it("handles cumulative finals without duplicating", () => {
    let buffer = createEmptyDictationBuffer();
    buffer = applyFinalTranscript(buffer, "hola");
    buffer = applyFinalTranscript(buffer, "hola doctor");
    assert.equal(buffer.committed, "hola doctor");
  });
});

describe("ClinicalDictationService", () => {
  it("runs start → partial/final → stop with mock speech provider", async () => {
    const speech = createMockSpeechProvider({
      mockTranscript: "paciente con cefalea",
      emitInterim: true,
    });
    const service = createClinicalDictationService({
      speechProvider: speech,
      consultationId: "c1",
    });

    await service.start();
    assert.equal(service.getState().status, "listening");
    assert.equal(service.getState().session?.consultationId, "c1");
    assert.ok(service.getState().buffer.partial);

    await service.stop();
    assert.equal(service.getState().status, "completed");
    assert.equal(
      service.getState().buffer.draft.includes("paciente con cefalea"),
      true,
    );
  });

  it("clears buffer without touching speech session state machine permanently", async () => {
    const speech = createMockSpeechProvider({
      mockTranscript: "texto",
      emitInterim: false,
    });
    const service = createClinicalDictationService({ speechProvider: speech });
    await service.start();
    await service.stop();
    service.clearBuffer();
    assert.equal(service.getState().buffer.draft, "");
    assert.equal(service.getState().status, "completed");
  });

  it("cancels an active session", async () => {
    const speech = createMockSpeechProvider({ emitInterim: false });
    const service = createClinicalDictationService({ speechProvider: speech });
    await service.start();
    await service.cancel("user");
    assert.equal(service.getState().status, "cancelled");
  });

  it("allows editable draft updates", async () => {
    const speech = createMockSpeechProvider({
      mockTranscript: "base",
      emitInterim: false,
    });
    const service = createClinicalDictationService({ speechProvider: speech });
    await service.start();
    await service.stop();
    service.setDraft("base editada por el médico");
    assert.equal(service.getState().buffer.draft, "base editada por el médico");
  });
});
