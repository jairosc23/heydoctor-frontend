/**
 * Shared Wave-3 client types mirroring BE advisory envelopes (WP-01).
 */

export type W3AuthorityEnvelope = {
  isAuthority: false;
  mayConfirm: false;
  mayEmit: false;
  mayReady: false;
};

export type W3MountCapability = {
  kind: string;
  visible: boolean;
  densityHint: "baseline" | "compact";
  slotLabel: string;
};

export type W3WorkspaceCapabilities = W3AuthorityEnvelope & {
  mounts: W3MountCapability[];
  maturityEnabled: boolean;
};

export type W3DenyCode =
  | "W3_FLAG_OFF"
  | "W3_CONTEXT_UNBOUND"
  | "W3_FORBIDDEN_ACTOR"
  | "W3_INVALID_STATE"
  | "W3_NOT_FOUND";

export function isW3AuthorityEnvelope(
  value: unknown,
): value is W3AuthorityEnvelope {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.isAuthority === false &&
    v.mayConfirm === false &&
    v.mayEmit === false &&
    v.mayReady === false
  );
}
