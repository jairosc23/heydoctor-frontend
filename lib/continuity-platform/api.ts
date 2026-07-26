import { heydoctorApi } from "@/lib/heydoctor-api";
import { CCP_CONTEXT_API_VERSION_V1, type ContinuityContext } from "./types";

export type FetchContinuityContextOptions = {
  encounterId?: string | null;
  timelineFrom?: string;
  timelineTo?: string;
  hintLimit?: number;
  /** F1 — defaults to pr9-ccp-v1 */
  acceptVersion?: string;
};

/**
 * C0 client — GET Continuity Context with version negotiation header.
 */
export async function fetchContinuityContext(
  patientId: string,
  options: FetchContinuityContextOptions = {},
): Promise<ContinuityContext> {
  const qs = new URLSearchParams();
  if (options.encounterId) qs.set("encounterId", options.encounterId);
  if (options.timelineFrom) qs.set("timelineFrom", options.timelineFrom);
  if (options.timelineTo) qs.set("timelineTo", options.timelineTo);
  if (options.hintLimit != null) qs.set("hintLimit", String(options.hintLimit));
  const q = qs.toString();
  const path = `/continuity/patients/${patientId}/context${q ? `?${q}` : ""}`;

  const res = await heydoctorApi.fetch<{ data: ContinuityContext }>(path, {
    method: "GET",
    headers: {
      "Accept-Continuity-Context":
        options.acceptVersion ?? CCP_CONTEXT_API_VERSION_V1,
    },
  });

  const ctx = res?.data;
  if (!ctx?.apiVersion) {
    throw new Error("continuity_context_invalid");
  }
  return ctx;
}
