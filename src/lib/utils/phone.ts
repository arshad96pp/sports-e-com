const INDIA_MOBILE_LOCAL = /^[6-9]\d{9}$/;

/**
 * Normalizes a raw, user-entered Indian mobile number into "+91XXXXXXXXXX",
 * or returns null if it isn't a valid 10-digit Indian mobile number.
 * Tolerates spaces/dashes and an accidentally-included +91/91 prefix (so it
 * never produces a doubled-up "+91+91…" value) — used identically on the
 * client (inline validation) and server (the source of truth) so the two
 * never disagree.
 */
export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.trim().replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  return INDIA_MOBILE_LOCAL.test(local) ? `+91${local}` : null;
}
