export type MarketplaceProviderRow = {
  providerId: string;
  displayName: string;
  specialties: string[];
  isAuthority: false;
};

export type W3MarketplaceWorkspaceProps = {
  enabled?: boolean;
  providers?: MarketplaceProviderRow[];
  specialties?: string[];
  referralCount?: number;
  connectorCount?: number;
  adminMode?: boolean;
  message?: string | null;
};

/**
 * WP-12 Clinical Marketplace — orchestration / discovery only.
 * Never Confirm / Emit / Orders. Clinical authority remains in COS.
 */
export function W3MarketplaceWorkspace({
  enabled = true,
  providers = [],
  specialties = [],
  referralCount = 0,
  connectorCount = 0,
  adminMode = false,
  message,
}: W3MarketplaceWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-marketplace-off">
        Marketplace (`w3.marketplace.core`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-marketplace-workspace"
      data-w3-flag="w3.marketplace.core"
      data-is-authority="false"
      data-orchestration-only="true"
      data-owns-cos="false"
      data-may-confirm="false"
      data-may-emit="false"
      data-may-order="false"
    >
      <header>
        <h2>Clinical Marketplace & Ecosystem</h2>
        <p>
          Provider discovery, specialty directory, referral hub, and ecosystem
          connectors. Orchestration only — HAB Confirm and Protocol Engine emit
          remain in COS.
        </p>
      </header>
      {message ? <p data-testid="w3-marketplace-message">{message}</p> : null}
      <p data-testid="w3-marketplace-stats">
        Providers: {providers.length} · Specialties: {specialties.length} ·
        Referrals: {referralCount} · Connectors: {connectorCount}
      </p>
      <ul data-testid="w3-marketplace-specialty-directory" aria-label="Specialties">
        {specialties.map((s) => (
          <li key={s} data-testid="w3-marketplace-specialty-row">
            {s}
          </li>
        ))}
      </ul>
      <ul data-testid="w3-marketplace-provider-list" aria-label="Providers">
        {providers.map((p) => (
          <li
            key={p.providerId}
            data-testid="w3-marketplace-provider-row"
            data-is-authority="false"
          >
            {p.displayName} ({p.specialties.join(", ")})
          </li>
        ))}
      </ul>
      {adminMode ? (
        <aside data-testid="w3-marketplace-admin-console" aria-label="Admin console">
          <h3>Administrative marketplace console</h3>
          <p>Tenant directory overview — no clinical authority controls.</p>
        </aside>
      ) : null}
    </section>
  );
}
