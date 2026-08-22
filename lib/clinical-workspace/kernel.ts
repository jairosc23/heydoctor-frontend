/**
 * Clinical Workspace Kernel — public contract.
 * Foundation is private. Encounter must not import it.
 */

import { createWorkspaceFoundation } from "./foundation";

export type WorkspaceMode =
  | "frame"
  | "drawer"
  | "modal"
  | "dialog"
  | "fullscreen";

export type WorkspaceSurfaceKind =
  | "chrome"
  | "rail"
  | "drawer"
  | "dialog"
  | "modal"
  | "fullscreen";

export type WorkspaceSurfaceId = string;

export type WorkspaceSurface = {
  id: WorkspaceSurfaceId;
  kind: WorkspaceSurfaceKind;
  blocking: boolean;
  onDismiss?: () => void;
  backdropAriaLabel?: string;
  backdropClassName?: string;
};

export type VisualWorkspaceState = {
  mode: WorkspaceMode;
  activeSurface: WorkspaceSurfaceId | null;
};

export type WorkspaceDrawer = WorkspaceSurface & { kind: "drawer" };
export type WorkspaceDialog = WorkspaceSurface & { kind: "dialog" };
export type WorkspaceModal = WorkspaceSurface & { kind: "modal" };

export type WorkspaceContentRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export type WorkspaceViewport = {
  sidebarWidth: number;
  panelHeaderHeight: number;
  encounterChromeHeight: number;
  safeTop: number;
  safeBottom: number;
  contentRect: WorkspaceContentRect;
};

export interface ClinicalWorkspaceKernel {
  present(surface: WorkspaceSurface): void;
  dismiss(id?: WorkspaceSurfaceId): void;
  dismissAll(): void;
  goToSection(sectionId: string): void;
  goBackToConsultas(): void;
  enterFullscreen(): void;
  exitFullscreen(): void;
  getViewport(): WorkspaceViewport;
  measureChrome(chrome: HTMLElement): number;
  publishChromeHeight(heightPx: number): void;
}

export { WORKSPACE_CHROME_FALLBACK_PX } from "./foundation";

export const CLINICAL_WORKSPACE_KERNEL_ID =
  "clinical-workspace-kernel" as const;

export const clinicalWorkspaceKernel: ClinicalWorkspaceKernel =
  createWorkspaceFoundation();
