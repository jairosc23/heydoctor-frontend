"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { isBrandMarkSvg } from "@/lib/brand-mark.constants";
import { BrandWordmark } from "@/components/branding/BrandWordmark";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";

const NAV_LINKS = [
  { href: "/consultar", label: "Consultar" },
  { href: "/for-doctors/apply", label: "Para Médicos" },
] as const;

type LandingNavClientProps = {
  brandMarkSrc: string;
};

export function LandingNavClient({ brandMarkSrc }: LandingNavClientProps) {
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
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center no-underline"
          onClick={close}
        >
          <NavBrand markSrc={brandMarkSrc} priority />
        </Link>

        <nav
          className="hidden items-center gap-3 md:flex"
          aria-label="Navegación principal"
        >
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 no-underline transition-all duration-200 hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
          <Button
            href="/login"
            variant="secondary"
            className="px-5 py-2 text-sm font-[family-name:Montserrat,sans-serif]"
          >
            Iniciar Sesión
          </Button>
          <Button
            href="/consulta-rapida"
            variant="primary"
            className="px-5 py-2 text-sm font-[family-name:Montserrat,sans-serif]"
          >
            Consulta rápida
          </Button>
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
              <NavBrand markSrc={brandMarkSrc} />
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
                className="w-full py-3 text-sm font-[family-name:Montserrat,sans-serif]"
              >
                Iniciar Sesión
              </Button>
              <Button
                href="/consulta-rapida"
                variant="primary"
                className="w-full py-3 text-sm font-[family-name:Montserrat,sans-serif]"
              >
                Consulta rápida
              </Button>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}

function NavBrand({
  markSrc,
  priority = false,
}: {
  markSrc: string;
  priority?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span
        className="inline-flex shrink-0 justify-center leading-none"
        style={{
          filter: "drop-shadow(0 10px 25px rgba(0, 150, 136, 0.2))",
        }}
        aria-hidden
      >
        <Image
          src={markSrc}
          alt=""
          width={36}
          height={36}
          priority={priority}
          unoptimized={isBrandMarkSvg(markSrc)}
          className="object-contain"
        />
      </span>
      <BrandWordmark variant="nav" className="truncate" />
    </div>
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
