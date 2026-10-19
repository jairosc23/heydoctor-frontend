/**
 * Default SafetyProvider selection for the Composer.
 * Production → HttpSafetyProvider.
 * Development/tests → Mock only when NEXT_PUBLIC_SAFETY_MOCK=1.
 */

import { createHttpSafetyProvider } from "./http-provider";
import { createMockSafetyProvider } from "./mock-provider";
import type { MockSafetyScenario } from "./mock-provider";
import type { SafetyProvider } from "./types";

export function isSafetyMockEnabled(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.NEXT_PUBLIC_SAFETY_MOCK === "1";
}

export function createDefaultSafetyProvider(
  mockScenario: MockSafetyScenario = "none",
): SafetyProvider {
  if (isSafetyMockEnabled()) {
    return createMockSafetyProvider(mockScenario);
  }
  return createHttpSafetyProvider();
}
