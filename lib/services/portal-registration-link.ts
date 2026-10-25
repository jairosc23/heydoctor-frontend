/** Keep invitation proof in same-tab session storage; never serialize it into a URL. */
export function patientRegistrationHref(bookingToken: string): string {
  return `/portal/register?bookingToken=${encodeURIComponent(bookingToken)}`;
}
