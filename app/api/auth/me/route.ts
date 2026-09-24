import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

// GET /api/auth/me — dice si hay una sesión de admin vigente
export async function GET() {
  if (await isAuthenticated()) {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}