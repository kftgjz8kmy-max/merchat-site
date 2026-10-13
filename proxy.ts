import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { localeCookieMaxAge, localeCookieName, localePaths, normalizeLocale } from "./i18n/locales";

const intlProxy = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const requestedLocale = normalizeLocale(request.nextUrl.searchParams.get("locale"));
  if (request.nextUrl.searchParams.has("locale") && requestedLocale) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("locale");
    url.pathname = localePaths[requestedLocale];

    const response = NextResponse.redirect(url);
    response.cookies.set(localeCookieName, requestedLocale, {
      path: "/",
      maxAge: localeCookieMaxAge,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  return intlProxy(request);
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
