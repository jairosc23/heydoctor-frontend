export type HcxBreadcrumbItem = {
  id: string;
  label: string;
  href?: string;
  current?: boolean;
};

export type HcxBreadcrumbsProps = {
  items: HcxBreadcrumbItem[];
};

/** Structural breadcrumbs — no clinical route semantics required. */
export function HcxBreadcrumbs({ items }: HcxBreadcrumbsProps) {
  return (
    <nav
      aria-label="Miga de pan"
      data-testid="hcx-breadcrumbs"
      style={{
        padding: "var(--hcx-space-2) var(--hcx-space-4)",
        fontFamily: "var(--hcx-font-family-ui)",
        fontSize: "var(--hcx-font-size-meta)",
        color: "var(--hcx-color-text-secondary)",
      }}
    >
      <ol
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--hcx-space-2)",
          listStyle: "none",
          margin: 0,
          padding: 0,
        }}
      >
        {items.map((item, index) => (
          <li key={item.id} style={{ display: "inline-flex", gap: "var(--hcx-space-2)" }}>
            {index > 0 ? <span aria-hidden>/</span> : null}
            {item.current || !item.href ? (
              <span
                aria-current={item.current ? "page" : undefined}
                style={{
                  color: item.current
                    ? "var(--hcx-color-text-primary)"
                    : "var(--hcx-color-text-secondary)",
                  fontWeight: item.current
                    ? "var(--hcx-font-weight-semibold)"
                    : undefined,
                }}
              >
                {item.label}
              </span>
            ) : (
              <a
                href={item.href}
                className="hcx-focus-ring"
                style={{ color: "var(--hcx-color-text-link)", textDecoration: "none" }}
              >
                {item.label}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
