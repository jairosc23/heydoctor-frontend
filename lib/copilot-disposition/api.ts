import { heydoctorApi } from "../heydoctor-api";

export type CopilotDispositionKind =
  | "dispose_accept"
  | "dispose_reject"
  | "dispose_refine"
  | "dispose_ignore";

export type CopilotDispositionRecord = {
  dispositionId: string;
  kind: CopilotDispositionKind;
  consultationId: string | null;
  proposalRef: string | null;
  authorityChannel: "medical_copilot_disposition";
  isHumanAuthorityConfirm: false;
  emissionPerformed: false;
  clinicalPersistencePerformed: false;
};

const BASE = "/copilot-disposition";

/** E02 Dispose — never HAB Confirm, never emit. */
export async function submitCopilotDisposition(input: {
  kind: CopilotDispositionKind;
  consultationId?: string;
  proposalRef?: string;
  note?: string;
}): Promise<CopilotDispositionRecord> {
  const res = await heydoctorApi.post<{ data: CopilotDispositionRecord }>(
    `${BASE}/dispose`,
    input,
  );
  return res.data;
}
