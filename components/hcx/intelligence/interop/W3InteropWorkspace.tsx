export type W3InteropWorkspaceProps = {
  enabled?: boolean;
  quarantineCount?: number;
  exportCount?: number;
  connectors?: Array<{ connectorId: string; name: string; ownsCos: false }>;
  message?: string | null;
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
    >
      <header>
        <h2>Clinical Interoperability (governed)</h2>
        <p>
          FHIR façade, quarantine imports, auditable exports. Connectors never
          own COS. HAB remains sole Confirm authority.
        </p>
      </header>
      {message ? <p data-testid="w3-interop-message">{message}</p> : null}
      <p data-testid="w3-interop-stats">
        Quarantine: {quarantineCount} · Exports: {exportCount}
      </p>
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
