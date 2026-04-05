import type { Metadata } from "next";
import { CookieBanner } from "@/components/CookieBanner";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://heydoctor.health",
  ),

  title: "HeyDoctor",
  description: "Atención médica online y presencial",

  icons: {
    icon: "/logo-heydoctor.png",
  },

  openGraph: {
    title: "HeyDoctor",
    description: "Atención médica online y presencial",
    url: "https://heydoctor.health",
    siteName: "HeyDoctor",
    images: ["/logo-heydoctor.png"],
    locale: "es_CL",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "HeyDoctor",
    description: "Atención médica online y presencial",
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
        <Providers>{children}</Providers>
        <CookieBanner />
      </body>
    </html>
  );
}
