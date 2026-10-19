/**
 * Digital Clinic — business process layer.
 * Orchestrates navigation to LTS surfaces. Does not write Core.
 * Does not reproject Product Platform v1.0–v6.0.
 */

import type { OperationalPulseDashboard } from "../../product-platform/operational-pulse";
import { loadOperationalPulse } from "../../product-platform/operational-pulse";
import {
  DIGITAL_CLINIC_PROCESSES,
  LTS_ROUTES,
  ltsBriefHref,
  ltsContinuityHref,
  ltsEncounterHref,
  type DigitalClinicNavStep,
  type DigitalClinicProcess,
} from "./types";

export { DIGITAL_CLINIC_PROCESSES };

export function navigateAtencion(input: {
  patientId?: string;
  encounterId?: string;
}): DigitalClinicNavStep[] {
  const steps: DigitalClinicNavStep[] = [];
  const patientId = input.patientId?.trim();
  const encounterId = input.encounterId?.trim();
  if (patientId) {
    steps.push({
      href: ltsBriefHref(patientId),
      process: "atencion",
      writes: false,
    });
    steps.push({
      href: ltsContinuityHref(patientId),
      process: "atencion",
      writes: false,
    });
  }
  if (encounterId) {
    steps.push({
      href: ltsEncounterHref(encounterId),
      process: "atencion",
      writes: false,
    });
  } else {
    steps.push({
      href: LTS_ROUTES.consultas,
      process: "atencion",
      writes: false,
    });
  }
  return steps;
}

export function navigateCaja(input: { encounterId?: string }): DigitalClinicNavStep[] {
  const steps: DigitalClinicNavStep[] = [
    {
      href: LTS_ROUTES.integridadIngresos,
      process: "caja",
      writes: false,
    },
  ];
  const encounterId = input.encounterId?.trim();
  if (encounterId) {
    steps.push({
      href: ltsEncounterHref(encounterId),
      process: "caja",
      writes: false,
    });
  }
  return steps;
}

export function navigateDireccion(): DigitalClinicNavStep[] {
  return [
    {
      href: LTS_ROUTES.pulsoOperativo,
      process: "direccion",
      writes: false,
    },
  ];
}

/**
 * Operaciones reads a certified pulse photograph and routes to v1.0 / v2.0.
 * Does not recompute backlog or commercial cubes.
 */
export function navigateOperaciones(
  pulse: OperationalPulseDashboard,
): DigitalClinicNavStep[] {
  const steps: DigitalClinicNavStep[] = [
    {
      href: LTS_ROUTES.pulsoOperativo,
      process: "operaciones",
      writes: false,
    },
  ];
  if (pulse.metrics.pulseDeliveryBacklog > 0) {
    steps.push({
      href: LTS_ROUTES.entregaClinica,
      process: "operaciones",
      writes: false,
    });
  }
  if (pulse.metrics.pulseCommercialAtRisk > 0) {
    steps.push({
      href: LTS_ROUTES.integridadIngresos,
      process: "operaciones",
      writes: false,
    });
  }
  return steps;
}

export function processActor(process: DigitalClinicProcess) {
  return DIGITAL_CLINIC_PROCESSES[process].actor;
}

export async function loadOperacionesNavigation(): Promise<DigitalClinicNavStep[]> {
  const pulse = await loadOperationalPulse();
  return navigateOperaciones(pulse);
}
