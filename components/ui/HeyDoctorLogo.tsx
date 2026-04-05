import Image from "next/image";

export default function HeyDoctorLogo({
  size = 64,
  priority = false,
}: {
  size?: number;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo-heydoctor.png"
      alt="HeyDoctor"
      width={size}
      height={size}
      priority={priority}
      className="object-contain drop-shadow-md transition-transform duration-200 ease-out hover:scale-105"
    />
  );
}
