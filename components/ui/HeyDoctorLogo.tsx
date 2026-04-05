import Image from "next/image";

export default function HeyDoctorLogo({
  size = 64,
  priority = false,
  className,
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  const base =
    "object-contain drop-shadow-md transition-transform duration-200 ease-out hover:scale-105";
  return (
    <Image
      src="/logo-heydoctor.png"
      alt="HeyDoctor"
      width={size}
      height={size}
      priority={priority}
      className={className ? `${base} ${className}` : base}
    />
  );
}
