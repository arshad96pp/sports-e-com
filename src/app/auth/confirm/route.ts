import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SITE_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { PASSWORD_RECOVERY_COOKIE, PASSWORD_RECOVERY_MAX_AGE_SEC } from "@/lib/auth/password-recovery";

function appOrigin(): string {
  return SITE_URL.replace(/\/$/, "");
}

function resetRedirect(reason?: "missing" | "expired" | "invalid"): URL {
  const url = new URL("/auth/reset-password", `${appOrigin()}/`);
  if (reason) url.searchParams.set("reason", reason);
  return url;
}

/**
 * Verifies a Supabase recovery `token_hash` from the reset email and starts a
 * short-lived recovery session. Does NOT change the password — that happens
 * on POST via `resetPasswordAction`.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (!tokenHash || type !== "recovery") {
    return NextResponse.redirect(resetRedirect("missing"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });

  if (error) {
    const expired = error.code === "otp_expired";
    return NextResponse.redirect(resetRedirect(expired ? "expired" : "invalid"));
  }

  const cookieStore = await cookies();
  cookieStore.set(PASSWORD_RECOVERY_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PASSWORD_RECOVERY_MAX_AGE_SEC,
    path: "/",
  });

  const response = NextResponse.redirect(resetRedirect());
  response.cookies.set(PASSWORD_RECOVERY_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: PASSWORD_RECOVERY_MAX_AGE_SEC,
    path: "/",
  });
  return response;
}
