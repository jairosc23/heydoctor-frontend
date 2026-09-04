import PanelLayout from "@/components/PanelLayout";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PanelLayout>{children}</PanelLayout>;
}
