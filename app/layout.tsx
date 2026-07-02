import type { Metadata } from "next";
import { connection } from "next/server";
import { Analytics } from "@vercel/analytics/react";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { GlobalWhatsAppFab } from "@/components/GlobalWhatsAppFab";
import { Providers } from "@/components/Providers";
import { absoluteUrl, siteName } from "@/lib/seo";
import "./globals.css";

const SITE_DESCRIPTION = "Consulta médica online inmediata";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),

  title: siteName,
  description: SITE_DESCRIPTION,

  icons: {
    icon: "/logo-heydoctor.png",
  },

  openGraph: {
    title: siteName,
    description: SITE_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName,
    locale: "es_CL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();

  return (
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Open+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <AnalyticsProvider>{children}</AnalyticsProvider>
        </Providers>
        <CookieBanner />
        <GlobalWhatsAppFab />
        <Analytics />
      </body>
    </html>
  );
}
