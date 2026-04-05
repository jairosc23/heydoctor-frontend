import Image from "next/image";
import { cn } from "@/lib/utils";

export default function HeyDoctorLogo({
  size = 64,
  priority = false,
  className,
}: {
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-block leading-none", className)}
      style={{
        filter: "drop-shadow(0 10px 25px rgba(0, 150, 136, 0.25))",
      }}
    >
      <Image
        src="/logo-heydoctor.png"
        alt="HeyDoctor"
        width={size}
        height={size}
        priority={priority}
        className={cn(
          "object-contain transition-transform duration-300 hover:scale-105 drop-shadow-lg",
        )}
      />
    </span>
  );
}
