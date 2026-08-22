import { clinicalWorkspaceKernel } from "./kernel";

export function openWorkspaceCopilot(): void {
  clinicalWorkspaceKernel.present({
    id: "copilot",
    kind: "drawer",
    blocking: true,
    backdropClassName: "clinical-drawer-enter bg-slate-900/10",
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
