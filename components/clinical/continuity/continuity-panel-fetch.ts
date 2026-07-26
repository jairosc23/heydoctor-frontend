/**
 * PR-10 C1 — ContinuityPanelFetch + generationId discard helpers.
 * Uses C0 wire path via heydoctorApi (AbortSignal) + types only from
 * lib/continuity-platform/types (I4 — no barrel / no hydration modules).
 */

import { ApiError, heydoctorApi } from "@/lib/heydoctor-api";
import {
  CCP_CONTEXT_API_VERSION_V1,
  type ContinuityContext,
} from "@/lib/continuity-platform/types";
import type {
  ContinuityPanelError,
  ContinuityPanelErrorCode,
  ContinuityPanelModel,
} from "./continuity-panel.types";

export type ContinuityFetchJob = {
  generationId: number;
  patientId: string;
  encounterId?: string | null;
  signal: AbortSignal;
};

export type ContinuityFetchResult =
  | { ok: true; context: ContinuityContext }
  | { ok: false; error: ContinuityPanelError };

function mapHttpToCode(status: number): ContinuityPanelErrorCode {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 406) return "version_unsupported";
  return "unknown";
}

/**
 * GET Continuity Context with Accept-Continuity-Context (C0 wire, unchanged).
 */
export async function runContextFetch(
  job: ContinuityFetchJob,
): Promise<ContinuityFetchResult> {
  const qs = new URLSearchParams();
  if (job.encounterId) qs.set("encounterId", job.encounterId);
  const q = qs.toString();
  const path = `/continuity/patients/${job.patientId}/context${q ? `?${q}` : ""}`;

  try {
    const res = await heydoctorApi.fetch<{ data: ContinuityContext }>(path, {
      method: "GET",
      cache: "no-store",
      signal: job.signal,
      headers: {
        "Accept-Continuity-Context": CCP_CONTEXT_API_VERSION_V1,
      },
    });
    const ctx = res?.data;
    if (!ctx?.apiVersion) {
      return { ok: false, error: { code: "invalid_payload" } };
    }
    return { ok: true, context: ctx };
  } catch (err) {
    if (job.signal.aborted) {
      return { ok: false, error: { code: "network" } };
    }
    if (err instanceof ApiError) {
      return {
        ok: false,
        error: { code: mapHttpToCode(err.status), httpStatus: err.status },
      };
    }
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, error: { code: "network" } };
    }
    return { ok: false, error: { code: "network" } };
  }
}

/**
 * Discard stale / aborted / wrong-patient / closed-panel responses (T2).
 */
export function shouldDiscardFetchResult(
  model: ContinuityPanelModel,
  job: ContinuityFetchJob,
): boolean {
  if (job.generationId !== model.generationId) return true;
  if (job.signal.aborted) return true;
  if (model.uiState === "Closed" || model.uiState === "Dismissed") return true;
  if (job.patientId !== model.patientId) return true;
  return false;
}
