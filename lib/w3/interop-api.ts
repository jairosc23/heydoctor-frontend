import { w3Fetch } from "@/lib/w3/w3-http";

/** BE open/workspace projection — governed quarantine/export only. */
export type InteropOpenResponse = {
  workspaceId?: string;
  clinicId?: string;
  persisted?: boolean;
  connectors?: Array<{
    connectorId?: string;
    name?: string;
    ownsCos?: boolean;
    protocol?: string;
    direction?: string;
    enabled?: boolean;
  }>;
  quarantine?: Array<{
    quarantineId?: string;
    status?: string;
    resourceType?: string;
    ownsCos?: boolean;
    mayConfirm?: boolean;
    mayEmit?: boolean;
  }>;
  exports?: Array<{
    exportId?: string;
    status?: string;
    resourceType?: string;
    mayBypassHab?: boolean;
    mayBypassProtocolEngine?: boolean;
  }>;
  ownsCos?: boolean;
  mayConfirm?: boolean;
  mayEmit?: boolean;
  mayBypassHab?: boolean;
  governed?: boolean;
};

export type InteropHarnessView = {
  workspaceId: string | null;
  clinicId: string | null;
  persisted: boolean;
  quarantineCount: number;
  exportCount: number;
  quarantineStatuses: Array<{
    quarantineId: string;
    status: string;
    resourceType: string;
  }>;
  exportStatuses: Array<{
    exportId: string;
    status: string;
    resourceType: string;
  }>;
  connectors: Array<{
    connectorId: string;
    name: string;
    ownsCos: false;
  }>;
  message: string;
};

/**
 * Map durable BE open payload → harness props.
 * Always force ownsCos=false / no Confirm chrome (fail-closed).
 */
export function mapInteropOpenToHarness(
  payload: InteropOpenResponse | null | undefined,
): InteropHarnessView {
  const connectors = Array.isArray(payload?.connectors)
    ? payload!.connectors!.map((c) => ({
        connectorId: String(c.connectorId ?? ""),
        name: String(c.name ?? "Connector"),
        ownsCos: false as const,
      }))
    : [];

  const quarantine = Array.isArray(payload?.quarantine)
    ? payload!.quarantine!
    : [];
  const exports = Array.isArray(payload?.exports) ? payload!.exports! : [];

  const quarantineStatuses = quarantine.map((q) => ({
    quarantineId: String(q.quarantineId ?? ""),
    status: String(q.status ?? "unknown"),
    resourceType: String(q.resourceType ?? "unknown"),
  }));

  const exportStatuses = exports.map((e) => ({
    exportId: String(e.exportId ?? ""),
    status: String(e.status ?? "unknown"),
    resourceType: String(e.resourceType ?? "unknown"),
  }));

  const persisted = payload?.persisted === true;
  const workspaceId =
    typeof payload?.workspaceId === "string" ? payload.workspaceId : null;
  const clinicId =
    typeof payload?.clinicId === "string" ? payload.clinicId : null;

  return {
    workspaceId,
    clinicId,
    persisted,
    quarantineCount: quarantineStatuses.length,
    exportCount: exportStatuses.length,
    quarantineStatuses,
    exportStatuses,
    connectors,
    message: persisted
      ? "Durable interop — quarantine/export staging only. No HAB bypass / COS ownership."
      : "Interop workspace — quarantine only. No HAB bypass.",
  };
}

export async function w3InteropOpen(
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/interop/workspace/open", {
    method: "POST",
    body: "{}",
    fetcher,
    baseUrl,
    domainPrefix: "W3_INTEROP",
  });
  return res.json() as Promise<InteropOpenResponse>;
}
