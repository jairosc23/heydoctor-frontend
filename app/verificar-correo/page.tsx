import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailCard from "./verify-email-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verificar correo",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function VerificarCorreoPage() {
  return (
    <Suspense>
      <VerifyEmailCard />
    </Suspense>
  );
}
