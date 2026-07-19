import { PublicBookingStatusView } from "./booking-status-view";

export default async function PublicBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ payment?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  return (
    <PublicBookingStatusView
      token={token}
      paymentHint={query.payment ?? null}
    />
  );
}
