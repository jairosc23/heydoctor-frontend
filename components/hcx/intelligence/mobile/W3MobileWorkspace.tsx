export type W3MobileWorkspaceProps = {
  enabled?: boolean;
  sessionState?: string;
  cacheCount?: number;
  pendingSyncCount?: number;
  navigationRoots?: string[];
  message?: string | null;
};

/**
 * WP-11 Mobile clinical experience — responsive / offline-aware.
 * Offline never modifies authority. Sync requires validation.
 */
export function W3MobileWorkspace({
  enabled = true,
  sessionState = "active",
  cacheCount = 0,
  pendingSyncCount = 0,
  navigationRoots = ["orientation", "timeline", "assist", "collab"],
  message,
}: W3MobileWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-mobile-off">
        Mobile Experience (`w3.mobile.experience`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-mobile-workspace"
      data-w3-flag="w3.mobile.experience"
      data-is-authority="false"
      data-offline-may-modify-authority="false"
      data-governed-sync="true"
      data-responsive="true"
      style={{ maxWidth: 480, margin: "0 auto" }}
    >
      <header>
        <h2>Mobile Clinical Experience</h2>
        <p>
          Compact navigation, offline read cache, governed sync queue. Pending
          ops require validation. Confirm remains on COS HAB host.
        </p>
      </header>
      {message ? <p data-testid="w3-mobile-message">{message}</p> : null}
      <p data-testid="w3-mobile-session">Session: {sessionState}</p>
      <p data-testid="w3-mobile-cache">Offline cache entries: {cacheCount}</p>
      <p data-testid="w3-mobile-sync">Pending sync: {pendingSyncCount}</p>
      <nav data-testid="w3-mobile-nav" aria-label="Mobile navigation">
        <ul>
          {navigationRoots.map((r) => (
            <li key={r} data-testid="w3-mobile-nav-item">
              {r}
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
