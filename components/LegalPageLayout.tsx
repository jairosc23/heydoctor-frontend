"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { LEGAL_EFFECTIVE_DATE, LEGAL_VERSION, PRODUCT } from "@/lib/legal-constants";

const FONT_HEADING = "Montserrat, sans-serif";

const LEGAL_NAV = [
  { href: "/terms", label: "Términos" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/telemedicine-consent", label: "Consentimiento" },
  { href: "/data-processing", label: "Datos" },
  { href: "/cookies", label: "Cookies" },
];

export function LegalPageLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-hd-surface-base text-primaryDark">
      <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
        <Container className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
          <Link href="/" className="no-underline">
            <BrandLogo variant="nav" priority />
          </Link>
          <nav
            className="flex flex-wrap items-center gap-1 sm:gap-2"
            aria-label="Documentos legales"
          >
            {LEGAL_NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-medium no-underline transition-colors duration-hd-base focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    active
                      ? "bg-primaryLight text-primary"
                      : "text-primaryDark/70 hover:bg-hd-surface-muted hover:text-primary",
                  )}
                  style={{ fontFamily: FONT_HEADING }}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </Container>
      </header>

      <main className="py-10 sm:py-12">
        <Container className="max-w-3xl">
          <h1
            className="mb-2 text-[28px] font-bold tracking-tight text-primary sm:text-[34px]"
            style={{ fontFamily: FONT_HEADING }}
          >
            {title}
          </h1>
          <p className="mb-9 text-sm text-primaryDark/60">
            Versión {LEGAL_VERSION} · Vigente desde: {LEGAL_EFFECTIVE_DATE}
          </p>

          <div
            className={cn(
              "text-[15px] leading-[1.85] text-primaryDark/90",
              "[&_a]:font-semibold [&_a]:text-primary [&_a]:no-underline hover:[&_a]:underline",
              "[&_p]:mb-4",
              "[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5",
              "[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5",
              "[&_strong]:text-primaryDark",
              "[&_table]:mt-4 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
              "[&_thead_tr]:bg-hd-surface-muted",
              "[&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-primaryDark",
              "[&_td]:border-b [&_td]:border-hd-border-subtle [&_td]:px-3 [&_td]:py-2",
            )}
          >
            {children}
          </div>
        </Container>
      </main>

      <footer className="border-t border-hd-border-subtle bg-hd-surface-chrome px-6 py-6 text-center">
        <p className="m-0 text-xs text-primaryDark/50">
          © {new Date().getFullYear()} SAVAC LTDA · RUT 76.373.761-6 · {PRODUCT.name}
        </p>
      </footer>
    </div>
  );
}

export function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div id={id} className="mb-7 scroll-mt-20">
      <h2
        className="mb-2.5 text-lg font-bold text-primaryDark"
        style={{ fontFamily: FONT_HEADING }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}
