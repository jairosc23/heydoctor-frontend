import type {
  ClinicalWorkspaceKernel,
  WorkspaceSurface,
  WorkspaceSurfaceId,
} from "../kernel";

function present(_surface: WorkspaceSurface): void {}

function dismiss(_id?: WorkspaceSurfaceId): void {}

function dismissAll(): void {}

function goToSection(_sectionId: string): void {}

function goBackToConsultas(): void {}

function enterFullscreen(): void {}

function exitFullscreen(): void {}

export function createWorkspaceFoundation(): ClinicalWorkspaceKernel {
  return {
    present,
    dismiss,
    dismissAll,
    goToSection,
    goBackToConsultas,
    enterFullscreen,
    exitFullscreen,
  };
}
