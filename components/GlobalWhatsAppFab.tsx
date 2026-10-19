"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getWhatsAppBookingUrl } from "@/lib/whatsapp-url";
import { shouldHideGlobalWhatsAppFab } from "@/lib/whatsapp-fab-visibility";
import { WhatsappIcon } from "@/components/WhatsappIcon";

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

  if (shouldHideGlobalWhatsAppFab(pathname)) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg ring-2 ring-white/90 transition-transform hover:scale-105 hover:bg-[#1fb957] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 max-sm:right-4 max-sm:bottom-[calc(1.25rem+env(safe-area-inset-bottom))] sm:bottom-5 sm:right-5"
      aria-label="Abrir WhatsApp para consulta médica"
      title="WhatsApp — consulta rápida"
    >
      <WhatsappIcon className="h-7 w-7" size={28} />
    </a>
  );
}
