import { heydoctorApi } from "../heydoctor-api";
import type {
  AutonomousWorkflowPlanResponse,
  WorkflowPlanDecision,
} from "../types/autonomous-workflow";

export async function fetchAutonomousWorkflowPlan(params: {
  patientId: string;
  countryCode?: string;
  consultationId?: string;
}): Promise<AutonomousWorkflowPlanResponse> {
  const query = new URLSearchParams();
  if (params.countryCode) query.set("countryCode", params.countryCode);
  if (params.consultationId) query.set("consultationId", params.consultationId);
  const qs = query.toString();
  const res = await heydoctorApi.get<{ data: AutonomousWorkflowPlanResponse }>(
    `/autonomous-workflow/plan/patient/${params.patientId}${qs ? `?${qs}` : ""}`,
  );
  return res.data ?? (res as unknown as AutonomousWorkflowPlanResponse);
}

export async function recordWorkflowPlanDecision(input: {
  planId: string;
  patientId: string;
  decision: WorkflowPlanDecision;
}): Promise<{ recorded: true; decision: WorkflowPlanDecision }> {
  return heydoctorApi.post("/autonomous-workflow/decision", input);
}
