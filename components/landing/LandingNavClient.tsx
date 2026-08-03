"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { WhatsappIcon } from "@/components/WhatsappIcon";

const NAV_LINKS = [
  { href: "/consultar", label: "Marketplace" },
  { href: "/pricing", label: "Planes PRO" },
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
    <header className="sticky top-0 z-50 box-border h-[64px] border-b border-[#E8EEF0] bg-white">
      <Container className="flex h-full items-center">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center no-underline"
          onClick={close}
        >
          <BrandLogo variant="nav" priority className="min-w-0 origin-left scale-[1.12] truncate" />
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
              <WhatsappIcon size={16} />
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
              <BrandLogo variant="nav" className="min-w-0 origin-left scale-[1.12] truncate" />
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
                <WhatsappIcon size={16} />
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

