import type {
  ClinicalWorkspaceKernel,
  VisualWorkspaceState,
} from "../kernel";
import { measureChrome, publishChromeHeight } from "./chrome";
import {
  dismiss,
  dismissAll,
  getVisualWorkspaceState,
  present,
  subscribeVisualWorkspaceState,
} from "./overlay-manager";
import { getWorkspaceViewport } from "./viewport";

export { WORKSPACE_CHROME_FALLBACK_PX } from "./chrome";

const fullscreenListeners = new Set<() => void>();
let fullscreenActive = false;

function notifyFullscreen(): void {
  fullscreenListeners.forEach((listener) => listener());
}

function goToSection(_sectionId: string): void {}

function goBackToConsultas(): void {}

function enterFullscreen(): void {
  dismissAll();
  if (fullscreenActive) return;
  fullscreenActive = true;
  notifyFullscreen();
}

function exitFullscreen(): void {
  if (!fullscreenActive) return;
  fullscreenActive = false;
  notifyFullscreen();
}

function getVisualState(): VisualWorkspaceState {
  if (fullscreenActive) {
    return { mode: "fullscreen", activeSurface: "teleconsulta" };
  }
  return getVisualWorkspaceState();
}

function subscribeVisualState(listener: () => void): () => void {
  fullscreenListeners.add(listener);
  const unsub = subscribeVisualWorkspaceState(listener);
  return () => {
    fullscreenListeners.delete(listener);
    unsub();
  };
}

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
    getVisualState,
    subscribeVisualState,
  };
}
