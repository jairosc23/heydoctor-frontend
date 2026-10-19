/**
 * CP-31 — DictationBuffer helpers (pure, in-memory).
 */

import type { DictationBuffer } from "./types";
import { EMPTY_DICTATION_BUFFER } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}

export function createEmptyDictationBuffer(): DictationBuffer {
  return { ...EMPTY_DICTATION_BUFFER };
}

export function applyPartialTranscript(
  buffer: DictationBuffer,
  text: string,
): DictationBuffer {
  return {
    ...buffer,
    partial: text,
    // Live preview: committed + partial (draft follows unless clinician edited away).
    draft: joinCommittedAndPartial(buffer.committed, text),
    updatedAt: nowIso(),
  };
}

export function applyFinalTranscript(
  buffer: DictationBuffer,
  text: string,
): DictationBuffer {
  const incoming = text.trim();
  const committed =
    buffer.committed && incoming.startsWith(buffer.committed)
      ? incoming
      : buffer.committed
        ? `${buffer.committed} ${incoming}`.trim()
        : incoming;
  return {
    draft: committed,
    partial: null,
    committed,
    updatedAt: nowIso(),
  };
}

export function setDictationDraft(
  buffer: DictationBuffer,
  draft: string,
): DictationBuffer {
  return {
    ...buffer,
    draft,
    updatedAt: nowIso(),
  };
}

export function clearDictationBuffer(): DictationBuffer {
  return {
    ...EMPTY_DICTATION_BUFFER,
    updatedAt: nowIso(),
  };
}

export function joinCommittedAndPartial(
  committed: string,
  partial: string | null,
): string {
  if (!partial) return committed;
  if (!committed) return partial;
  return `${committed} ${partial}`.trim();
}
