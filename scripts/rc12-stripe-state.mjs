export function paymentState(row, id) {
  if (row?.paymentId !== id) throw new Error("RC12_BLOCKED:payment_correlation");
  if (!["pending", "paid"].includes(row.status)) throw new Error("RC12_BLOCKED:payment_not_approved");
  return row.status;
}
export function clinicalState(value, id) {
  const row = value?.data ?? value;
  if (row?.id !== id) throw new Error("RC12_BLOCKED:consultation_correlation");
  const state = String(row.status).toLowerCase();
  if (!["signed", "locked"].includes(state)) throw new Error("RC12_BLOCKED:clinical_transition");
  return state;
}
/** Register every observer before scheduling the triggering action. Own all rejections. */
export function observeThenAct(observers, action) {
  return Promise.all([...observers.map((observer) => Promise.resolve().then(observer)),
    Promise.resolve().then(action)]);
}
