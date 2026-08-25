import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE = "wavy_session";
const MAX_AGE = 24 * 60 * 60; // 1 hari, samakan dgn expiry JWT backend

interface Session {
  access_token: string;
  customer: { id: number; name: string | null; email: string };
}

function parseSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

function cookieOpts(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  };
}

// GET /api/auth/session — baca session (buat client/guard, token tetap tersembunyi)
export async function GET() {
  const store = await cookies();
  const session = parseSession(store.get(COOKIE)?.value);
  return NextResponse.json({ user: session ? session.customer : null });
}

// POST /api/auth/session — simpan session (dipanggil setelah verify-otp)
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as Partial<Session>;
  if (!body.access_token || !body.customer) {
    return NextResponse.json({ error: "invalid session payload" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, JSON.stringify(body), cookieOpts(MAX_AGE));
  return res;
}

// DELETE /api/auth/session — logout
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", cookieOpts(0));
  return res;
}