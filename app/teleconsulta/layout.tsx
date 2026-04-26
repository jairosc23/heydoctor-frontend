import { ConsultationProvider } from "@/context/ConsultationContext";

export default function TeleconsultaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConsultationProvider>{children}</ConsultationProvider>;
}
