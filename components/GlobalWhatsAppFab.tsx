"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";

/**
 * Botón flotante global: mensaje dinámico con enlace a /consulta-rapida
 * según el origen actual (útil en preview y multi-dominio).
 */
export function GlobalWhatsAppFab() {
  const pathname = usePathname();
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    setHref(getWhatsAppBookingUrl(window.location.origin));
  }, []);

  if (!href) return null;

  const hide =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/teleconsulta/");
  if (hide) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg ring-2 ring-white/90 transition-transform hover:scale-105 hover:bg-[#1fb957] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 max-sm:right-4 max-sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-5 sm:right-5"
      aria-label="Abrir WhatsApp para consulta médica"
      title="WhatsApp — consulta rápida"
    >
      <WhatsappGlyph className="h-7 w-7" />
    </a>
  );
}

function WhatsappGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
