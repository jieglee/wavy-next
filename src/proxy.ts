import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { ADMIN_TOKEN_COOKIE, isAdminTokenUsable } from "./lib/admin-token";

const intlProxy = createMiddleware(routing);

// /admin, /id/admin/..., /en/admin/... -> { locale, rest } ; selain itu null.
// Tanpa prefix locale: pakai bahasa yang tersimpan di cookie NEXT_LOCALE (pilihan terakhir user).
function matchAdmin(pathname: string, savedLocale: string | undefined) {
  const m = pathname.match(/^(?:\/(id|en))?\/admin(\/.*)?$/);
  if (!m) return null;
  const saved = (routing.locales as readonly string[]).includes(savedLocale ?? "") ? savedLocale! : routing.defaultLocale;
  return { locale: m[1] ?? saved, rest: (m[2] ?? "").replace(/\/+$/, "") };
}

export function proxy(request: NextRequest) {
  // Portal admin: wajib sesi admin (cookie terpisah dari sesi customer).
  // Ini cek optimistis; backend tetap memverifikasi token admin di setiap request.
  const admin = matchAdmin(request.nextUrl.pathname, request.cookies.get("NEXT_LOCALE")?.value);
  if (admin) {
    const loggedIn = isAdminTokenUsable(request.cookies.get(ADMIN_TOKEN_COOKIE)?.value);
    const onLogin = admin.rest === "/login";
    const target = !loggedIn && !onLogin ? "/admin/login" : loggedIn && (onLogin || admin.rest === "") ? "/admin/dashboard" : null;
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = `/${admin.locale}${target}`;
      url.search = "";
      const res = NextResponse.redirect(url);
      // cookie kedaluwarsa/rusak dibersihkan supaya tidak terus dicek
      if (!loggedIn && request.cookies.has(ADMIN_TOKEN_COOKIE)) res.cookies.delete(ADMIN_TOKEN_COOKIE);
      return res;
    }
  }

  return intlProxy(request);
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
