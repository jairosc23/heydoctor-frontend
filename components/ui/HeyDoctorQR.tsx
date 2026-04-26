import Image from "next/image";

export default function HeyDoctorQR() {
  return (
    <div className="p-3 bg-white rounded-xl shadow-md">
      <Image
        src="/qr-heydoctor.png"
        alt="QR HeyDoctor"
        width={120}
        height={120}
        className="object-contain"
      />
    </div>
  );
}
