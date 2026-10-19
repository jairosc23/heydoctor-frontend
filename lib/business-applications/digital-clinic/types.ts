export type DigitalClinicProcess =
  | "atencion"
  | "caja"
  | "direccion"
  | "operaciones";

export type DigitalClinicActor =
  | "medico"
  | "caja"
  | "direccion_medica"
  | "operaciones";

export type DigitalClinicNavStep = {
  href: string;
  process: DigitalClinicProcess;
  writes: false;
};

export const DIGITAL_CLINIC_PASS = [
  "BA-1",
  "BA-2",
  "BA-3",
  "BA-4",
  "BA-5",
  "BA-6",
  "BA-7",
  "BA-8",
  "BA-9",
  "BA-10",
  "BA-11",
  "BA-12",
] as const;

export const LTS_ROUTES = {
  consultas: "/panel/consultas",
  entregaClinica: "/panel/entrega-clinica",
  integridadIngresos: "/panel/integridad-ingresos",
  pulsoOperativo: "/panel/pulso-operativo",
} as const;

export function ltsEncounterHref(encounterId: string): string {
  return `/panel/consultas/${encounterId.trim()}`;
}

export function ltsBriefHref(patientId: string): string {
  return `/panel/brief-previsita/${patientId.trim()}`;
}

export function ltsContinuityHref(patientId: string): string {
  return `/panel/continuidad-longitudinal/${patientId.trim()}`;
}

export const DIGITAL_CLINIC_PROCESSES: Record<
  DigitalClinicProcess,
  { actor: DigitalClinicActor; writes: false }
> = {
  atencion: { actor: "medico", writes: false },
  caja: { actor: "caja", writes: false },
  direccion: { actor: "direccion_medica", writes: false },
  operaciones: { actor: "operaciones", writes: false },
};
