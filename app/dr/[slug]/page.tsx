import { notFound } from "next/navigation";
import {
  fetchDoctorBySlugCached,
  fetchDoctorRatingsCached,
} from "@/lib/server/public-doctors";
import { DoctorProfileView } from "./doctor-profile-view";

export default async function DoctorSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let doctor;
  try {
    doctor = await fetchDoctorBySlugCached(slug);
  } catch {
    notFound();
  }

  let ratings;
  try {
    ratings = await fetchDoctorRatingsCached(slug);
  } catch {
    ratings = { ratings: [], average: 0, count: 0 };
  }

  return <DoctorProfileView doctor={doctor} ratings={ratings} />;
}
