import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "semper_admin";
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Firma la cookie de sesión con HMAC-SHA256 para que nadie pueda falsificarla
function signToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + WEEK_MS })
  ).toString("base64url");
  const sig = createHmac("sha256", process.env.SESSION_SECRET || "dev-secret")
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

// Valida la firma y la expiración de una cookie de sesión
function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = createHmac("sha256", process.env.SESSION_SECRET || "dev-secret")
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}

// Verifica si la petición actual tiene una sesión de admin válida
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(SESSION_COOKIE)?.value);
}

// Para endpoints protegidos: devuelve null si hay sesión, o una respuesta 401 lista para retornar
export async function requireAuth(): Promise<NextResponse | null> {
  if (await isAuthenticated()) return null;
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

// Compara la contraseña en tiempo constante contra ADMIN_PASSWORD
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// Genera y devuelve el valor de la cookie para la sesión
export function issueSessionToken(): string {
  return signToken();
}