import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Owner PIN for /admin. Change it here, or set an ADMIN_PIN secret to override
 * it without touching code. Checked on the server only; never sent to browsers.
 */
export const DEFAULT_ADMIN_PIN = "1234";

export function expectedAdminPin(): string {
  return process.env["ADMIN_PIN"]?.trim() || DEFAULT_ADMIN_PIN;
}

export function pinMatches(input: string, expected = expectedAdminPin()): boolean {
  const a = createHash("sha256").update(input.trim(), "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}
