import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match locale prefix
  const localePattern = /^\/(es|en|pt)(\/|$)/;
  const localeMatch = pathname.match(localePattern);
  const locale = localeMatch ? localeMatch[1] : "es";

  // Protected routes
  const isProtected =
    pathname.match(/^\/(es|en|pt)\/(dashboard|demos)(\/|$)/) !== null;
  const isAuthRoute =
    pathname.match(/^\/(es|en|pt)\/auth(\/|$)/) !== null;

  // Run Supabase session refresh
  let user = null;
  try {
    const result = await updateSession(request);
    user = result.user;
    // If session refresh set cookies, carry them forward via supabaseResponse
    // but we still run intl middleware for routing
    if (isProtected && !user) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  } catch {
    // Supabase not configured — allow through
    if (isProtected) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
