import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** Rutas públicas indexables existentes en SSOT (Sprint 1). */
const PUBLIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/login", changeFrequency: "monthly", priority: 0.5 },
  { path: "/register", changeFrequency: "monthly", priority: 0.5 },
  { path: "/consulta-rapida", changeFrequency: "weekly", priority: 0.9 },
  { path: "/consultar", changeFrequency: "weekly", priority: 0.9 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.7 },
  { path: "/demo/interactive", changeFrequency: "monthly", priority: 0.6 },
  { path: "/for-doctors/apply", changeFrequency: "monthly", priority: 0.6 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.3 },
  { path: "/data-processing", changeFrequency: "yearly", priority: 0.3 },
  { path: "/telemedicine-consent", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PUBLIC_ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: absoluteUrl(path),
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
