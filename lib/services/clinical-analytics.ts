import { heydoctorApi } from "../heydoctor-api";

const BASE = "/clinical-analytics";

export interface ConsultationsByDayRow {
  day: string;
  count: number;
}

export interface ConsultationsByDoctorRow {
  doctor_id: string;
  count: number;
}

export interface RevenueSummary {
  revenue_paid?: number;
  revenue_pending?: number;
  paid_count?: number;
  pending_count?: number;
}

export interface ExecutiveDashboard {
  consultationsByDay: ConsultationsByDayRow[];
  consultationsByDoctor: ConsultationsByDoctorRow[];
  newPatients30d: number;
  totalPatients: number;
  recurringPatients30d: number;
  revenue: RevenueSummary;
  generatedAt: string;
}

export async function fetchExecutiveDashboard(): Promise<ExecutiveDashboard> {
  return heydoctorApi.get<ExecutiveDashboard>(`${BASE}/executive`);
}
