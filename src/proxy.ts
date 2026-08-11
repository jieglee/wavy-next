import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlProxy = createMiddleware(routing);

export function proxy(request: NextRequest) {
  // Locale routing jalan duluan (redirect/rewrite /id, /en, dll)
  const intlResponse = intlProxy(request);
  if (intlResponse) return intlResponse;

  // TODO: taro logic auth guard di sini nanti,
  // misal cek token/session buat path /[locale]/user atau /[locale]/admin

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};