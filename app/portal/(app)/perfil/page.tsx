"use client";

import { useEffect, useState } from "react";
import { heydoctorApi } from "@/lib/heydoctor-api";
import { useAuth } from "@/lib/context/AuthContext";

const FONT = "Montserrat, sans-serif";

export default function PortalProfilePage() {
  const { user } = useAuth();
  const [patient, setPatient] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = await heydoctorApi.get<Record<string, unknown>>("/portal/me");
        if (!cancelled) setPatient(me);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Error al cargar perfil");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 text-3xl font-bold text-primary" style={{ fontFamily: FONT }}>
        Mi perfil
      </h1>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="space-y-3 rounded-2xl border border-hd-border-subtle bg-white p-6 text-sm">
        <p>
          <span className="text-xs uppercase text-primaryDark/50">Cuenta</span>
          <br />
          {user?.email} · rol {user?.role}
        </p>
        <p>
          <span className="text-xs uppercase text-primaryDark/50">Clínica</span>
          <br />
          {user?.clinicId}
        </p>
        {patient ? (
          <>
            <p>
              <span className="text-xs uppercase text-primaryDark/50">Nombre</span>
              <br />
              {(patient.displayName as string) || (patient.name as string)}
            </p>
            <p>
              <span className="text-xs uppercase text-primaryDark/50">
                Paciente clínico
              </span>
              <br />
              {String(patient.id)}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
