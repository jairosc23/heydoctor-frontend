"use client";

import { useAuth } from "@/lib/context/AuthContext";
import Card from "@/components/ui/Card";

const FONT_HEADING = "Montserrat, sans-serif";

export default function ConfigPage() {
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split("@")[0] : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="mb-3 text-2xl font-bold text-primary"
          style={{ fontFamily: FONT_HEADING }}
        >
          Configuración
        </h1>
        <p className="m-0 text-primaryDark/70">
          Ajustes del centro médico y tu cuenta.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6 shadow-premium">
          <h3
            className="mb-4 text-base font-bold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            Mi cuenta
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-primaryDark/50">
                Email
              </label>
              <p className="m-0 text-sm text-primaryDark">
                {user?.email ?? "—"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-primaryDark/50">
                Nombre
              </label>
              <p className="m-0 text-sm text-primaryDark">
                {displayName || "—"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-primaryDark/50">
                Rol
              </label>
              <p className="m-0 text-sm text-primaryDark">
                {user?.role || "—"}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs text-primaryDark/50">
                Plan
              </label>
              <span
                className={`inline-block rounded-md px-3 py-1 text-xs font-bold ${
                  user?.plan === "pro"
                    ? "bg-primaryLight text-primary"
                    : "bg-hd-surface-muted text-primaryDark/70"
                }`}
              >
                {(user?.plan ?? "free").toUpperCase()}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-premium">
          <h3
            className="mb-4 text-base font-bold text-primaryDark"
            style={{ fontFamily: FONT_HEADING }}
          >
            Centro Médico
          </h3>
          <p className="m-0 text-[13px] leading-relaxed text-primaryDark/60">
            La configuración del centro médico (nombre, dirección, horarios,
            especialidades) estará disponible próximamente.
          </p>
        </Card>
      </div>
    </div>
  );
}
