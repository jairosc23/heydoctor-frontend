export const SPECIALTY_ICON_COLOR = "#17B5B4";
export const FALLBACK_SPECIALTY_ICON = "medical";

export const CANONICAL_SPECIALTY_SLUGS = [
  "general-medicine",
  "pediatrics",
  "family-medicine",
  "psychology",
  "nutrition",
  "urology",
  "ophthalmology",
  "gynecology",
  "orthopedics",
  "otolaryngology",
  "bariatric-surgery",
  "vascular-surgery",
  "cardiology",
  "internal-medicine",
  "aesthetic-medicine",
  "dentistry",
] as const;

export type CanonicalSpecialtySlug = (typeof CANONICAL_SPECIALTY_SLUGS)[number];
export type SpecialtyIconId = CanonicalSpecialtySlug | typeof FALLBACK_SPECIALTY_ICON;

const CANONICAL: ReadonlySet<string> = new Set(CANONICAL_SPECIALTY_SLUGS);

function isCanonicalSpecialtySlug(value: string): value is CanonicalSpecialtySlug {
  return CANONICAL.has(value);
}

export const SPECIALTY_ICON_PATHS: Record<SpecialtyIconId, readonly string[]> = {
  medical: ["M12 3.5a8.5 8.5 0 1 0 0 17a8.5 8.5 0 0 0 0-17z", "M12 8v8", "M8 12h8"],
  "general-medicine": [
    "M8 4.5v5",
    "M16 4.5v5",
    "M8 9.5a4 4 0 0 0 8 0",
    "M12 13.5v1.2c0 1.6 1.3 2.8 3 2.8",
    "M15 15.6a1.9 1.9 0 1 0 0 3.8a1.9 1.9 0 0 0 0-3.8z",
  ],
  pediatrics: [
    "M12 4.8a2.1 2.1 0 1 0 0 4.2a2.1 2.1 0 0 0 0-4.2z",
    "M7.8 19c.5-3.1 2.2-4.8 4.2-4.8s3.7 1.7 4.2 4.8",
  ],
  "family-medicine": [
    "M8 6.2a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 0 0 0-3.4z",
    "M16 6.2a1.7 1.7 0 1 0 0 3.4a1.7 1.7 0 0 0 0-3.4z",
    "M4.8 18.2c.4-2.4 1.6-3.6 3.2-3.6s2.8 1.2 3.2 3.6",
    "M12.8 18.2c.4-2.4 1.6-3.6 3.2-3.6s2.8 1.2 3.2 3.6",
  ],
  psychology: [
    "M12 3.8a8.2 8.2 0 1 0 0 16.4a8.2 8.2 0 0 0 0-16.4z",
    "M8.6 12.2c.7-1.1 1.4-1.1 2.1 0s1.4 1.1 2.1 0 1.4-1.1 2.1 0",
  ],
  nutrition: [
    "M12 8.2c-2.6 0-4.6 2-4.6 4.8 0 3 2 5.4 4.6 5.4s4.6-2.4 4.6-5.4c0-2.8-2-4.8-4.6-4.8z",
    "M12 8.2c.2-2.2 1.4-3.4 3-3.8",
    "M13.4 6.2c.9.1 1.7-.3 2.3-.9",
  ],
  urology: [
    "M14.8 6.4c-2.2.2-3.6 2.2-3.4 4.2.1 1.2.8 2.2 1.8 2.6-1.2.7-2 2-2 3.6 0 2.2 1.7 3.8 3.8 3.8 2.8 0 4.6-2.2 4.6-5.6 0-3.2-2-5.4-4.8-8.6z",
  ],
  ophthalmology: [
    "M2.8 12s3.4-5.6 9.2-5.6 9.2 5.6 9.2 5.6-3.4 5.6-9.2 5.6S2.8 12 2.8 12z",
    "M12 9.4a2.6 2.6 0 1 0 0 5.2a2.6 2.6 0 0 0 0-5.2z",
  ],
  gynecology: [
    "M12 4.2a4 4 0 1 0 0 8a4 4 0 0 0 0-8z",
    "M12 12.2v7",
    "M9.2 16.2h5.6",
  ],
  orthopedics: [
    "M7.2 8.6a1.8 1.8 0 1 0 0 3.2",
    "M7.2 12.2a1.8 1.8 0 1 0 0 3.2",
    "M16.8 8.6a1.8 1.8 0 1 1 0 3.2",
    "M16.8 12.2a1.8 1.8 0 1 1 0 3.2",
    "M8.4 11h7.2",
    "M8.4 13h7.2",
  ],
  otolaryngology: [
    "M15.2 5.2c-3.2 0-5.4 2.2-5.4 5.2 0 2 .9 3.2 2.1 4.1-.2 1.5.5 2.8 2 3.3",
    "M9.8 10.4c0-2.5 1.8-4 3.8-4 1.7 0 2.8 1.1 2.8 2.6 0 1.8-1.3 2.4-2.2 3-.8.5-1.2 1.1-1.2 1.8",
  ],
  "bariatric-surgery": [
    "M10.2 4.4c-.2 2.2.2 3.4 1.4 4.8 1.4 1.6 1.5 2.8.6 5.4-.9 2.4-.2 4.2 1.6 4.2 2 0 3.4-1.6 4.2-3.4.7-1.6.4-3.8-1.2-6-1.2-1.6-1.4-3-1.2-5",
  ],
  "vascular-surgery": ["M12 20v-8", "M12 12 6.2 5.2", "M12 12 17.8 5.2"],
  cardiology: [
    "M12 19.2s-6.2-4-6.2-8.1a3.4 3.4 0 0 1 6.2-1.9 3.4 3.4 0 0 1 6.2 1.9c0 4.1-6.2 8.1-6.2 8.1z",
  ],
  "internal-medicine": [
    "M9.2 5.2h5.6",
    "M10.2 3.8h3.6v2.6h-3.6z",
    "M8 6.4h8a1.4 1.4 0 0 1 1.4 1.4v10.2a1.4 1.4 0 0 1-1.4 1.4H8a1.4 1.4 0 0 1-1.4-1.4V7.8A1.4 1.4 0 0 1 8 6.4z",
    "M12 10.4v4.2",
    "M9.9 12.5h4.2",
  ],
  "aesthetic-medicine": [
    "M10.2 5c-2.4 1.1-3.8 3.4-3.8 7s1.4 5.9 3.8 7c1.1.4 2.2.4 3 .1",
    "M8.4 10.2h.1",
    "M8.2 14.4c.8.8 2 .8 2.8 0",
    "M16.2 6.2l.5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5z",
  ],
  dentistry: [
    "M8.2 8.2c0-2.2 1.6-3.6 3.8-3.6s3.8 1.4 3.8 3.6c0 1.2-.4 2-1 2.5.2 2.5.4 5.1.2 6.4-.1.8-.9 1.1-1.3.2-.4-1.2-.7-2.1-1.3-2.1s-.9.9-1.3 2.1c-.4.9-1.2.6-1.3-.2-.2-1.3 0-3.9.2-6.4-.6-.5-1-1.3-1-2.5z",
  ],
};

export function readSpecialtySlug(record: { slug?: unknown } | null | undefined): string | null {
  const slug = typeof record?.slug === "string" ? record.slug.trim() : "";
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null;
}

export function specialtyIconId(slug: string | null | undefined): SpecialtyIconId {
  const value = typeof slug === "string" ? slug.trim() : "";
  return isCanonicalSpecialtySlug(value) ? value : FALLBACK_SPECIALTY_ICON;
}

export function specialtyIconModel(slug: string | null | undefined, size = 24) {
  const id = specialtyIconId(slug);
  const safeSize = size === 32 || size === 48 || size === 24 ? size : 24;
  return {
    id,
    paths: SPECIALTY_ICON_PATHS[id],
    size: safeSize,
    color: SPECIALTY_ICON_COLOR,
    viewBox: 24,
  };
}
