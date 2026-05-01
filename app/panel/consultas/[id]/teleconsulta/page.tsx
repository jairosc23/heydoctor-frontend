"use client";

import { useParams, useRouter } from "next/navigation";
import { useConsultation } from "@/context/ConsultationContext";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";

export default function TeleconsultaPanelPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = (params?.id as string) ?? "";
  const { doctorId, isLoading: ctxBootLoading } = useConsultation();

  return (
    <TeleconsultaVideoSession
      roomId={consultationId}
      consultationId={consultationId}
      isDoctor={!!doctorId}
      onEndCall={() => router.push("/panel/consultas")}
      panelGate={{ consultationId, ctxBootLoading }}
      panelDeniedHref="/panel/consultas"
      callChrome={{
        backHref: consultationId
          ? `/panel/consultas/${consultationId}`
          : "/panel/consultas",
        backLabel: "Volver",
      }}
    />
  );
}
