// Server action errors are redacted in production, so actions return a result
// object instead of throwing.
export type ActionResult<T> = ({ ok: true } & T) | { ok: false; error: string };

// Rethrows a failed result on the client so React Query exposes it as `error`.
export function unwrapActionResult<T>(result: ActionResult<T>) {
  if (!result.ok) {
    throw new Error(result.error);
  }

  return result;
}
