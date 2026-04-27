import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CookieBanner } from "@/components/CookieBanner";
import { GlobalWhatsAppFab } from "@/components/GlobalWhatsAppFab";
import { Providers } from "@/components/Providers";
import "./globals.css";

const SITE_DESCRIPTION = "Consulta médica online inmediata";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://heydoctor.health",
  ),

  title: "HeyDoctor",
  description: SITE_DESCRIPTION,

  icons: {
    icon: "/logo-heydoctor.png",
  },

  openGraph: {
    title: "HeyDoctor",
    description: SITE_DESCRIPTION,
    url: "https://heydoctor.health",
    siteName: "HeyDoctor",
    images: ["/logo-heydoctor.png"],
    locale: "es_CL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HeyDoctor",
    description: SITE_DESCRIPTION,
    images: ["/logo-heydoctor.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
