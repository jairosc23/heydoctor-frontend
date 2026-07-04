import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import { absoluteUrl, siteName } from "@/lib/seo";

const title = "Planes HeyDoctor PRO | Marketplace clínico";
const description =
  "Explora planes HeyDoctor PRO para teleconsulta, toolkit clínico e infraestructura enterprise con activación comercial.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl("/pricing"),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/pricing"),
    siteName,
    locale: "es_CL",
    type: "website",
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Planes HeyDoctor PRO",
      },
    ],
  },
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-hd-surface-base text-primaryDark">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex h-16 items-center justify-between">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <p
            className="hidden text-sm text-primaryDark/70 sm:block"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Planes PRO para toolkit clínico y teleconsulta
          </p>
        </Container>
      </header>
      {children}
    </div>
  );
}
