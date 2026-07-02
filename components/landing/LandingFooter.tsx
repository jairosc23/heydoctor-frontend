import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Container from "@/components/ui/Container";

const FOOTER_COLUMNS = [
  {
    title: "Para pacientes",
    links: [
      { href: "/consultar", label: "Consultar" },
      { href: "/consulta-rapida", label: "Consulta rápida" },
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
        <div className="flex flex-col gap-8 border-b border-white/10 pb-10 sm:flex-row sm:items-start sm:justify-between">
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
                        className="text-sm text-slate-400 no-underline transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="w-full shrink-0 rounded-2xl border border-[#25D366]/30 bg-[#043638] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <a
              href={whatsAppHref}
              target={whatsAppUrl ? "_blank" : undefined}
              rel={whatsAppUrl ? "noopener noreferrer" : undefined}
              className="flex items-start gap-4 no-underline"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white">
                <WhatsappIcon />
              </span>
              <span>
                <span className="block text-base font-semibold text-white">
                  Consulta por WhatsApp
                </span>
                <span className="mt-1 block text-sm text-slate-300">
                  Atención en menos de 1 minuto
                </span>
              </span>
            </a>
          </div>
        </div>

        <div className="mt-8 pt-2">
          <p className="text-sm text-slate-500">
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

function WhatsappIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
