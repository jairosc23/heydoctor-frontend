import { authorize } from "../scripts/rc12-stripe-preflight.mjs";

/** Run before the shared auth fixture: missing secrets must FAIL, never skip P0-4. */
export default function setup() {
  authorize(process.env);
}
