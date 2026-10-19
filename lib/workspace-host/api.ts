import { heydoctorApi } from "../heydoctor-api";

export type WorkspaceMountKind =
  | "assist"
  | "documentation"
  | "therapy"
  | "confirmation"
  | "orientation"
  | "clinical_work";

export type WorkspaceHostSession = {
  sessionId: string;
  state: string;
  clinicId: string;
  patientId: string;
  consultationId: string;
  doctorId: string;
  contextBindingId: string | null;
  mounts: Array<{
    mountId: string;
    kind: WorkspaceMountKind;
    active: boolean;
  }>;
};

const BASE = "/workspace-host";

export async function openWorkspaceHostSession(input: {
  consultationId: string;
  patientId: string;
}): Promise<WorkspaceHostSession> {
  const res = await heydoctorApi.post<{ data: WorkspaceHostSession }>(
    `${BASE}/session/open`,
    input,
  );
  return res.data;
}

export async function activateWorkspaceMount(
  sessionId: string,
  mountId: string,
): Promise<WorkspaceHostSession> {
  const res = await heydoctorApi.post<{ data: WorkspaceHostSession }>(
    `${BASE}/session/${encodeURIComponent(sessionId)}/mounts/activate`,
    { mountId },
  );
  return res.data;
}
