"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConsultation } from "@/context/ConsultationContext";
import { TeleconsultaVideoSession } from "@/components/webrtc/TeleconsultaVideoSession";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";

export default function TeleconsultaPanelPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = (params?.id as string) ?? "";
  const { doctorId, isLoading: ctxBootLoading } = useConsultation();

  useEffect(() => {
    clinicalWorkspaceKernel.enterFullscreen();
    return () => {
      clinicalWorkspaceKernel.exitFullscreen();
    };
  }, []);

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
