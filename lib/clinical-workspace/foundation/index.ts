import type { ClinicalWorkspaceKernel } from "../kernel";
import { measureChrome, publishChromeHeight } from "./chrome";
import { dismiss, dismissAll, present } from "./overlay-manager";
import { getWorkspaceViewport } from "./viewport";

export { WORKSPACE_CHROME_FALLBACK_PX } from "./chrome";

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
