export type {
  GovernedPhysicianWorkspaceComponentKey,
  GovernedPhysicianWorkspaceComponentPresence,
  GovernedPhysicianWorkspaceGovernance,
  GovernedPhysicianWorkspaceResult,
} from "./governed-physician-workspace";
export { GOVERNED_PHYSICIAN_WORKSPACE_GOVERNANCE } from "./governed-physician-workspace";
export { mapGovernedPhysicianWorkspaceEnvelope } from "./governed-physician-workspace-mapper";
export {
  getGovernedPhysicianWorkspace,
  governedPhysicianWorkspaceReadAdapter,
  type GovernedPhysicianWorkspaceReadAdapter,
} from "./governed-physician-workspace-adapter";
export {
  useGovernedPhysicianWorkspace,
  type UseGovernedPhysicianWorkspaceOptions,
  type UseGovernedPhysicianWorkspaceResult,
} from "./governed-physician-workspace-hooks";
