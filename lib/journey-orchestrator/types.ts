/** E03 Consultation Journey — FE types (mirror BE). */

export type JourneyStage =
  | "Opened"
  | "Orienting"
  | "Exploring"
  | "Assisting"
  | "DisposingAssist"
  | "Documenting"
  | "ComposingTherapy"
  | "AwaitingConfirmation"
  | "ExecutingOwnedPath"
  | "Completing"
  | "Completed"
  | "CarryForwardPending"
  | "RebindRequired"
  | "AssistDegraded"
  | "ConfirmAbandoned"
  | "Abandoned"
  | "FailedClosed";

export type ConsultationJourneySession = {
  journeyId: string;
  consultationId: string;
  patientId: string;
  stage: JourneyStage;
  emissionPerformed: false;
  clinicalPersistencePerformed: false;
  authorityChannel: "consultation_journey_orchestrator";
};

export const JOURNEY_STAGE_LABELS: Record<JourneyStage, string> = {
  Opened: "Abierto",
  Orienting: "Orientación",
  Exploring: "Exploración",
  Assisting: "Asistencia IA",
  DisposingAssist: "Disposición de sugerencias",
  Documenting: "Documentación",
  ComposingTherapy: "Composición terapéutica",
  AwaitingConfirmation: "Confirmación HAB",
  ExecutingOwnedPath: "Ejecución post-confirmación",
  Completing: "Cierre",
  Completed: "Completado",
  CarryForwardPending: "Continuidad (informativa)",
  RebindRequired: "Requiere revinculación",
  AssistDegraded: "Asistencia degradada",
  ConfirmAbandoned: "Confirmación abandonada",
  Abandoned: "Abandonado",
  FailedClosed: "Fallido (fail-closed)",
};
