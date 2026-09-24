import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Estados permitidos para un lead
const STATUSES = ["nuevo", "contactado", "ganado", "perdido"];

// Convierte un campo a texto recortado (vacío si no es string)
function str(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

export const runtime = "nodejs";

// POST /api/leads — público: crea un lead (widget o formulario de cotización)
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const name = str(body.name, 200);
  const phone = str(body.phone, 50);
  if (!name || !phone) {
    return NextResponse.json(
      { error: "Nombre y teléfono son obligatorios" },
      { status: 400 }
    );
  }

  const email = str(body.email, 200);
  const zone = str(body.zone, 200);
  const projectType = str(body.projectType, 100);
  const preferredDate = str(body.preferredDate, 40);
  const message = str(body.message, 2000);
  const source = str(body.source, 60) || "widget";

  try {
    const rows = await db()(
      `INSERT INTO leads (name, phone, email, zone, project_type, preferred_date, message, source, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'nuevo')
       RETURNING id`,
      [name, phone, email, zone, projectType, preferredDate, message, source]
    );
    return NextResponse.json({ ok: true, id: rows[0]?.id }, { status: 201 });
  } catch (err) {
    console.error("Error creando lead:", err);
    return NextResponse.json(
      { error: "No se pudo guardar el lead" },
      { status: 500 }
    );
  }
}

// GET /api/leads?status=... — solo admin: lista de leads (más recientes primero)
export async function GET(req: Request) {
  const guard = await requireAuth();
  if (guard) return guard;

  const status = new URL(req.url).searchParams.get("status");
  try {
    const rows = status
      ? await db()(
          `SELECT * FROM leads WHERE status = $1 ORDER BY created_at DESC LIMIT 200`,
          [status]
        )
      : await db()(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 200`);
    return NextResponse.json({ leads: rows });
  } catch (err) {
    console.error("Error listando leads:", err);
    return NextResponse.json(
      { error: "No se pudieron cargar los leads" },
      { status: 500 }
    );
  }
}