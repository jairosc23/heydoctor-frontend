"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  fetchMyDoctorProfile,
  fetchMyDoctorProfileCompleteness,
  getDoctorProfileErrorMessage,
  isDoctorProfileAccessDenied,
  updateMyDoctorProfile,
  type DoctorProfileCompleteness,
  type DoctorProfileCompletenessField,
  type MyDoctorProfileResponse,
} from "@/lib/services/my-doctor-profile";

type ProfessionalProfileForm = {
  name: string;
  specialty: string;
  licenseNumber: string;
  licenseAuthority: string;
  professionalEmail: string;
  professionalPhone: string;
  professionalAddress: string;
  country: string;
  signatureUrl: string;
};

const EMPTY_FORM: ProfessionalProfileForm = {
  name: "",
  specialty: "",
  licenseNumber: "",
  licenseAuthority: "",
  professionalEmail: "",
  professionalPhone: "",
  professionalAddress: "",
  country: "CL",
  signatureUrl: "",
};

const FIELD_LABELS: Record<DoctorProfileCompletenessField, string> = {
  name: "Nombre profesional",
  specialty: "Especialidad",
  licenseNumber: "Número de registro profesional",
  licenseAuthority: "Autoridad de registro",
  professionalEmail: "Email profesional",
  professionalPhone: "Teléfono profesional",
  professionalAddress: "Dirección profesional",
  country: "País",
  signatureUrl: "URL de firma",
};

const FIELDS: Array<{
  name: keyof ProfessionalProfileForm;
  label: string;
  type?: string;
  placeholder?: string;
}> = [
  {
    name: "name",
    label: "Nombre profesional",
    placeholder: "Dr. Jairo Santana Candelo",
  },
  {
    name: "specialty",
    label: "Especialidad",
    placeholder: "Medicina General",
  },
  {
    name: "licenseNumber",
    label: "Número de registro profesional",
    placeholder: "Registro / licencia profesional",
  },
  {
    name: "licenseAuthority",
    label: "Autoridad de registro",
    placeholder: "Superintendencia, colegio médico o autoridad local",
  },
  {
    name: "professionalEmail",
    label: "Email profesional",
    type: "email",
    placeholder: "doctor@dominio.cl",
  },
  {
    name: "professionalPhone",
    label: "Teléfono profesional",
    type: "tel",
    placeholder: "+56 9 1234 5678",
  },
  {
    name: "professionalAddress",
    label: "Dirección profesional",
    placeholder: "Dirección clínica o consulta",
  },
  { name: "country", label: "País", placeholder: "CL" },
  {
    name: "signatureUrl",
    label: "URL de firma",
    type: "url",
    placeholder: "https://...",
  },
];

function formFromResponse(response: MyDoctorProfileResponse): ProfessionalProfileForm {
  const profile = response.profile;
  if (!profile) return EMPTY_FORM;
  return {
    name: profile.name ?? "",
    specialty: profile.specialty ?? "",
    licenseNumber: profile.licenseNumber ?? "",
    licenseAuthority: profile.licenseAuthority ?? "",
    professionalEmail: profile.professionalEmail ?? "",
    professionalPhone: profile.professionalPhone ?? "",
    professionalAddress: profile.professionalAddress ?? "",
    country: profile.country ?? "CL",
    signatureUrl: profile.signatureUrl ?? "",
  };
}

function trimForm(form: ProfessionalProfileForm): ProfessionalProfileForm {
  return Object.fromEntries(
    Object.entries(form).map(([key, value]) => [key, value.trim()]),
  ) as ProfessionalProfileForm;
}

function profileErrorMessage(error: unknown, fallback: string): string {
  if (isDoctorProfileAccessDenied(error)) {
    return "No tienes permisos para administrar este perfil profesional.";
  }
  return getDoctorProfileErrorMessage(error, fallback);
}

export default function ProfessionalProfilePage() {
  const [form, setForm] = useState<ProfessionalProfileForm>(EMPTY_FORM);
  const [completeness, setCompleteness] =
    useState<DoctorProfileCompleteness | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const missingLabels = useMemo(
    () =>
      completeness?.missingFields.map((field) => FIELD_LABELS[field] ?? field) ??
      [],
    [completeness],
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSavedMessage(null);
    try {
      const [profileResponse, completenessResponse] = await Promise.all([
        fetchMyDoctorProfile(),
        fetchMyDoctorProfileCompleteness(),
      ]);
      setForm(formFromResponse(profileResponse));
      setCompleteness(completenessResponse);
    } catch (err) {
      setError(
        profileErrorMessage(err, "No se pudo cargar el perfil profesional"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSavedMessage(null);
    try {
      const response = await updateMyDoctorProfile(trimForm(form));
      setForm(formFromResponse(response));
      setCompleteness(response.completeness);
      setSavedMessage("Perfil profesional guardado correctamente.");
    } catch (err) {
      setError(
        profileErrorMessage(err, "No se pudo guardar el perfil profesional"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="m-0 text-2xl font-semibold text-slate-800">
            Perfil profesional
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Identidad profesional usada como fuente principal para documentos
            clínicos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadProfile()}
          disabled={loading || saving}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Recargar
        </button>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="m-0 text-base font-semibold text-slate-800">
              Estado de completitud
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              MVP-A muestra el estado operativo sin bloquear la generación de
              documentos.
            </p>
          </div>
          <span
            className={
              completeness?.isComplete
                ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800"
                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800"
            }
          >
            {completeness?.isComplete ? "Completo" : "Incompleto"}
          </span>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-slate-600">Cargando perfil...</p>
        )}

        {!loading && missingLabels.length > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="m-0 text-sm font-semibold text-amber-900">
              Campos faltantes
            </p>
            <ul className="mb-0 mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
              {missingLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        )}

        {!loading && completeness?.isComplete && (
          <p className="mt-4 text-sm font-medium text-emerald-700">
            El perfil profesional mínimo operativo está completo.
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
        <h2 className="mb-4 mt-0 text-base font-semibold text-slate-800">
          Datos profesionales
        </h2>

        {error && (
          <p
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {savedMessage && (
          <p className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            {savedMessage}
          </p>
        )}

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((field) => (
            <div
              key={field.name}
              className={
                field.name === "professionalAddress" ||
                field.name === "signatureUrl"
                  ? "md:col-span-2"
                  : undefined
              }
            >
              <label
                htmlFor={field.name}
                className="mb-1 block text-sm font-semibold text-slate-700"
              >
                {field.label}
              </label>
              <input
                id={field.name}
                type={field.type ?? "text"}
                value={form[field.name]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                placeholder={field.placeholder}
                disabled={loading || saving}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primaryLight disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2 md:col-span-2">
            <button
              type="submit"
              disabled={loading || saving}
              className="rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar perfil profesional"}
            </button>
            <p className="m-0 text-xs text-slate-500">
              Los campos guardados alimentan la identidad profesional en los
              documentos clínicos.
            </p>
          </div>
        </form>
      </section>
    </div>
  );
}
