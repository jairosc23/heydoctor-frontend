"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/consultar", label: "Consultar" },
  { href: "/for-doctors/apply", label: "Para Médicos" },
] as const;

export function LandingNavClient() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 box-border h-[72px] border-b border-[#E8EEF0] bg-white shadow-[0_1px_0_rgba(2,44,44,0.05)]">
      <Container className="flex h-full items-center">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center no-underline"
          onClick={close}
        >
          <BrandLogo variant="nav" priority className="min-w-0 truncate" />
        </Link>

        <div className="hidden w-[305px] shrink-0 md:block" aria-hidden />

        <nav
          className="hidden min-w-0 flex-1 items-center md:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-primaryDark no-underline transition-colors duration-200 hover:text-primary"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              {item.label}
            </Link>
          ))}
          <div className="ml-3 flex items-center gap-2">
            <Button
              href="/login"
              variant="secondary"
              className="h-10 min-h-10 rounded-lg border border-primary bg-white px-5 py-0 font-[Montserrat,sans-serif] text-sm font-medium text-primary shadow-none hover:bg-primaryLight hover:scale-100"
            >
              Iniciar Sesión
            </Button>
            <Button
              href="/consulta-rapida"
              variant="primary"
              className="h-10 min-h-10 gap-2 rounded-lg border-0 bg-primary px-5 py-0 font-[Montserrat,sans-serif] text-sm font-medium shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100"
            >
              <WhatsappIcon />
              Consulta rápida
            </Button>
          </div>
        </nav>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:hidden"
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>
      </Container>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
            aria-label="Cerrar menú"
            onClick={close}
          />
          <nav
            id={panelId}
            className="fixed inset-y-0 right-0 z-50 flex w-[min(100vw-3rem,20rem)] flex-col border-l border-gray-100 bg-white p-5 shadow-premium md:hidden"
            aria-label="Menú de navegación móvil"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <BrandLogo variant="nav" className="min-w-0 truncate" />
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Cerrar menú"
                onClick={close}
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-3 text-base font-semibold text-gray-700 no-underline transition-colors hover:bg-gray-50"
                  onClick={close}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-3 pt-8">
              <Button
                href="/login"
                variant="secondary"
                className="w-full rounded-lg border-primary py-3 text-sm font-medium text-primary"
              >
                Iniciar Sesión
              </Button>
              <Button
                href="/consulta-rapida"
                variant="primary"
                className="w-full gap-2 rounded-lg bg-primary py-3 text-sm font-medium shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid"
              >
                <WhatsappIcon />
                Consulta rápida
              </Button>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.42c-.003 6.554-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z" />
    </svg>
  );
}
