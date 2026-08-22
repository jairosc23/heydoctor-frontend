import type {
  ClinicalWorkspaceKernel,
  WorkspaceSurface,
  WorkspaceSurfaceId,
} from "../kernel";
import { measureChrome, publishChromeHeight } from "./chrome";
import { getWorkspaceViewport } from "./viewport";

export { WORKSPACE_CHROME_FALLBACK_PX } from "./chrome";

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
    getViewport: getWorkspaceViewport,
    measureChrome,
    publishChromeHeight,
  };
}
