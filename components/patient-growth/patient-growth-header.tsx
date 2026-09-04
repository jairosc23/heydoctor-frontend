import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import { HdSkipLink } from "@/components/ui/HdFeedback";

const FONT_HEADING = "Montserrat, sans-serif";

const LINKS = [
  { href: "/medicos", label: "Médicos" },
  { href: "/especialidades", label: "Especialidades" },
  { href: "/consultar", label: "Urgente ahora" },
] as const;

export function PatientGrowthHeader() {
  return (
    <header className="border-b border-hd-border-subtle bg-hd-surface-chrome shadow-hd-1">
      <HdSkipLink />
      <Container className="flex min-h-16 flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link href="/" className="no-underline">
          <BrandLogo variant="nav" priority />
        </Link>
        <nav
          className="flex flex-1 flex-wrap items-center justify-end gap-1"
          aria-label="Recorrido del paciente"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-primaryDark no-underline transition-colors hover:text-primary"
              style={{ fontFamily: FONT_HEADING }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Button
          href="/consulta-rapida"
          variant="primary"
          className="h-10 min-h-10 rounded-lg px-4 text-sm"
        >
          Consulta rápida
        </Button>
      </Container>
    </header>
  );
}
