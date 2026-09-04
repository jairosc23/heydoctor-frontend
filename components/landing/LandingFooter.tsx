import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";
import { WhatsappIcon } from "@/components/WhatsappIcon";

const FOOTER_COLUMNS = [
  {
    title: "Para pacientes",
    links: [
      { href: "/medicos", label: "Buscar médico" },
      { href: "/especialidades", label: "Especialidades" },
      { href: "/consultar", label: "Marketplace" },
      { href: "/consulta-rapida", label: "Consulta rápida" },
      { href: "/pricing", label: "Planes PRO" },
    ],
  },
  {
    title: "Para médicos",
    links: [
      { href: "/for-doctors/apply", label: "Unirse" },
      { href: "/for-doctors/apply", label: "Recursos" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/", label: "Nosotros" },
      { href: "/consultar", label: "Contacto" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Términos" },
      { href: "/privacy", label: "Privacidad" },
    ],
  },
] as const;

type LandingFooterProps = {
  whatsAppUrl?: string | null;
};

export function LandingFooter({ whatsAppUrl }: LandingFooterProps) {
  const whatsAppHref = whatsAppUrl ?? "/consulta-rapida";

  return (
    <footer className="bg-primaryDark text-white">
      <Container className="py-14">
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <BrandLogo variant="footer" />
          <div className="flex items-center gap-3">
            <SocialIcon label="Facebook" />
            <SocialIcon label="Instagram" />
            <SocialIcon label="YouTube" />
            <SocialIcon label="LinkedIn" />
          </div>
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title}>
                <p className="mb-4 text-sm font-semibold text-white">{column.title}</p>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <Link
                        href={link.href}
                        className="text-sm text-white/70 no-underline transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-[#043638] p-5">
            <a
              href={whatsAppHref}
              target={whatsAppUrl ? "_blank" : undefined}
              rel={whatsAppUrl ? "noopener noreferrer" : undefined}
              className="flex items-start gap-4 no-underline"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                <WhatsappIcon size={22} />
              </span>
              <span>
                <span className="block text-base font-semibold text-white">
                  Consulta por WhatsApp
                </span>
                <span className="mt-1 block text-sm text-white/70">
                  Atención en menos de 1 minuto
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-2">
          <p className="text-sm text-white/50">
            &copy; {new Date().getFullYear()} HeyDoctor. Todos los derechos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}

function SocialIcon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-slate-200"
      aria-label={label}
      title={label}
    >
      <SocialGlyph label={label} />
    </span>
  );
}

function SocialGlyph({ label }: { label: string }) {
  if (label === "Facebook") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.02 4.388 11.016 10.125 11.91v-8.41H7.078v-3.5h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.5h-2.796v8.41C19.612 23.089 24 18.093 24 12.073z" />
      </svg>
    );
  }

  if (label === "Instagram") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.97.24 2.427.403.58.22.993.482 1.429.918.436.436.698.85.918 1.429.163.457.349 1.257.403 2.427.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.24 1.97-.403 2.427a3.86 3.86 0 0 1-.918 1.429 3.86 3.86 0 0 1-1.429.918c-.457.163-1.257.349-2.427.403-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.97-.24-2.427-.403a3.86 3.86 0 0 1-1.429-.918 3.86 3.86 0 0 1-.918-1.429c-.163-.457-.349-1.257-.403-2.427C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.054-1.17.24-1.97.403-2.427.22-.58.482-.993.918-1.429.436-.436.85-.698 1.429-.918.457-.163 1.257-.349 2.427-.403C8.416 2.175 8.796 2.163 12 2.163zm0 1.622c-3.15 0-3.521.012-4.756.068-1.015.046-1.566.214-1.932.356-.486.189-.833.415-1.197.779a3.24 3.24 0 0 0-.779 1.197c-.142.366-.31.917-.356 1.932-.056 1.235-.068 1.606-.068 4.756s.012 3.521.068 4.756c.046 1.015.214 1.566.356 1.932.189.486.415.833.779 1.197.364.364.711.59 1.197.779.366.142.917.31 1.932.356 1.235.056 1.606.068 4.756.068s3.521-.012 4.756-.068c1.015-.046 1.566-.214 1.932-.356a3.24 3.24 0 0 0 1.197-.779 3.24 3.24 0 0 0 .779-1.197c.142-.366.31-.917.356-1.932.056-1.235.068-1.606.068-4.756s-.012-3.521-.068-4.756c-.046-1.015-.214-1.566-.356-1.932a3.24 3.24 0 0 0-.779-1.197 3.24 3.24 0 0 0-1.197-.779c-.366-.142-.917-.31-1.932-.356-1.235-.056-1.606-.068-4.756-.068zM12 7.378a4.622 4.622 0 1 1 0 9.244 4.622 4.622 0 0 1 0-9.244zm0 7.622a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm5.804-8.937a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0z" />
      </svg>
    );
  }

  if (label === "YouTube") {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 4.126 0 2.063 2.063 0 0 1-2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
