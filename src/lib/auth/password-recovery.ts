import "server-only";

/** HttpOnly flag set only after a recovery token is verified server-side. */
export const PASSWORD_RECOVERY_COOKIE = "enzo_password_recovery";

/** Matches the email copy and local GoTrue otp_expiry (30 minutes). */
export const PASSWORD_RECOVERY_MAX_AGE_SEC = 30 * 60;
