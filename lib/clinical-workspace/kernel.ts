/**
 * Clinical Workspace Kernel — public contract only.
 * No behavior. Foundation implements this later.
 */

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
};

export type VisualWorkspaceState = {
  mode: WorkspaceMode;
  activeSurface: WorkspaceSurfaceId | null;
};

export type WorkspaceDrawer = WorkspaceSurface & { kind: "drawer" };
export type WorkspaceDialog = WorkspaceSurface & { kind: "dialog" };
export type WorkspaceModal = WorkspaceSurface & { kind: "modal" };

export interface ClinicalWorkspaceKernel {
  present(surface: WorkspaceSurface): void;
  dismiss(id?: WorkspaceSurfaceId): void;
  dismissAll(): void;
  goToSection(sectionId: string): void;
  goBackToConsultas(): void;
  enterFullscreen(): void;
  exitFullscreen(): void;
}

export const CLINICAL_WORKSPACE_KERNEL_ID =
  "clinical-workspace-kernel" as const;
