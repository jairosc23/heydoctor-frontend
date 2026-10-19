/**
 * CP-30 — Web Speech API feature detection (browser-only).
 */

export type WebSpeechGlobalScope = {
  SpeechRecognition?: new () => WebSpeechRecognitionLike;
  webkitSpeechRecognition?: new () => WebSpeechRecognitionLike;
};

/** Minimal SpeechRecognition surface used by WebSpeechProvider (injectable in tests). */
export interface WebSpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((ev: Event) => void) | null;
  onresult: ((ev: WebSpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: ((ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

export type WebSpeechRecognitionEventLike = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: { transcript: string };
    };
  };
};

export function getWebSpeechRecognitionConstructor(
  scope: WebSpeechGlobalScope = globalThis as WebSpeechGlobalScope,
): (new () => WebSpeechRecognitionLike) | null {
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export function isWebSpeechApiAvailable(
  scope: WebSpeechGlobalScope = globalThis as WebSpeechGlobalScope,
): boolean {
  return getWebSpeechRecognitionConstructor(scope) !== null;
}
