export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://heydoctor.health"
).replace(/\/$/, "");

export const siteName = "HeyDoctor";

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
