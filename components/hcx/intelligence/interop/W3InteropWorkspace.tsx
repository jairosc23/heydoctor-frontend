export type W3InteropWorkspaceProps = {
  enabled?: boolean;
  quarantineCount?: number;
  exportCount?: number;
  connectors?: Array<{ connectorId: string; name: string; ownsCos: false }>;
  message?: string | null;
  /** Dev harness: durable workspace id (optional). */
  workspaceId?: string | null;
  persisted?: boolean;
  quarantineStatuses?: Array<{
    quarantineId: string;
    status: string;
    resourceType: string;
  }>;
  exportStatuses?: Array<{
    exportId: string;
    status: string;
    resourceType: string;
  }>;
};

/**
 * WP-10 Interoperability workspace — governed quarantine/export.
 * Never Confirm / Emit / bypass HAB.
 */
export function W3InteropWorkspace({
  enabled = true,
  quarantineCount = 0,
  exportCount = 0,
  connectors = [],
  message,
  workspaceId = null,
  persisted = false,
  quarantineStatuses = [],
  exportStatuses = [],
}: W3InteropWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-interop-off">
        Interoperability (`w3.interop.adapters`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-interop-workspace"
      data-w3-flag="w3.interop.adapters"
      data-is-authority="false"
      data-may-bypass-hab="false"
      data-owns-cos="false"
      data-governed="true"
      data-persisted={persisted ? "true" : "false"}
    >
      <header>
        <h2>Clinical Interoperability (governed)</h2>
        <p>
          FHIR façade, quarantine imports, auditable exports. Connectors never
          own COS. HAB remains sole Confirm authority.
        </p>
      </header>
      {message ? <p data-testid="w3-interop-message">{message}</p> : null}
      {workspaceId ? (
        <p data-testid="w3-interop-workspace-id">workspaceId={workspaceId}</p>
      ) : null}
      <p data-testid="w3-interop-stats">
        Quarantine: {quarantineCount} · Exports: {exportCount}
      </p>
      {quarantineStatuses.length > 0 ? (
        <ul data-testid="w3-interop-quarantine-status">
          {quarantineStatuses.map((q) => (
            <li key={q.quarantineId || `${q.resourceType}-${q.status}`}>
              {q.resourceType}: {q.status}
            </li>
          ))}
        </ul>
      ) : null}
      {exportStatuses.length > 0 ? (
        <ul data-testid="w3-interop-export-status">
          {exportStatuses.map((e) => (
            <li key={e.exportId || `${e.resourceType}-${e.status}`}>
              {e.resourceType}: {e.status}
            </li>
          ))}
        </ul>
      ) : null}
      <ul>
        {connectors.map((c) => (
          <li
            key={c.connectorId}
            data-testid="w3-interop-connector-row"
            data-owns-cos="false"
          >
            {c.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
