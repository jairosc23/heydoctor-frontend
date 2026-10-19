import { clinicalWorkspaceKernel } from "./kernel";

/** Copilot must dim the Encounter (D4). Stronger than other drawers; not the overlay contract. */
export const COPILOT_BACKDROP_CLASS = "clinical-drawer-enter bg-slate-900/45";

export function openWorkspaceCopilot(): void {
  clinicalWorkspaceKernel.present({
    id: "copilot",
    kind: "drawer",
    blocking: true,
    backdropClassName: COPILOT_BACKDROP_CLASS,
  });
}

export function openWorkspaceDoctorDna(): void {
  clinicalWorkspaceKernel.present({
    id: "doctor-dna",
    kind: "drawer",
    blocking: true,
    backdropAriaLabel: "Cerrar Doctor DNA Intelligence",
    backdropClassName: "bg-slate-900/10",
  });
}

export function openWorkspaceContinuity(): void {
  clinicalWorkspaceKernel.present({
    id: "continuity",
    kind: "drawer",
    blocking: true,
    backdropAriaLabel: "Cerrar Continuity",
    backdropClassName: "clinical-drawer-enter bg-slate-900/10",
  });
}

export function openWorkspaceShare(): void {
  clinicalWorkspaceKernel.present({
    id: "share",
    kind: "dialog",
    blocking: true,
    backdropAriaLabel: "Cerrar",
    backdropClassName: "bg-slate-900/55",
  });
}
