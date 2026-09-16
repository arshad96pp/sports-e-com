import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` — same mechanics, new name.
//
// This is a UX-level early redirect only. Every admin page/layout and every
// admin server action independently re-verifies `profiles.role === 'super_admin'`
// server-side via `requireSuperAdmin()` — this middleware check is not the
// authorization boundary, just avoids a flash of protected content.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { response, user } = await updateSession(request);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    // Role is re-checked authoritatively in the admin layout/actions; here we
    // only need to know a session exists before letting the request through.
  }

  if (pathname.startsWith("/account") && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
