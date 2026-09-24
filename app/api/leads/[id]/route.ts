import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

const STATUSES = ["nuevo", "contactado", "ganado", "perdido"];
export const runtime = "nodejs";

// PATCH /api/leads/[id] — solo admin: cambia el estado de un lead (o campos básicos)
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard) return guard;
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const status = body.status;
  if (typeof status !== "string" || !STATUSES.includes(status)) {
    return NextResponse.json(
      { error: "Estado inválido (usa: nuevo, contactado, ganado, perdido)" },
      { status: 400 }
    );
  }

  try {
    const rows = await db()(
      `UPDATE leads SET status = $1, updated_at = now() WHERE id = $2 RETURNING *`,
      [status, Number(id)]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, lead: rows[0] });
  } catch (err) {
    console.error("Error actualizando lead:", err);
    return NextResponse.json(
      { error: "No se pudo actualizar el lead" },
      { status: 500 }
    );
  }
}

// DELETE /api/leads/[id] — solo admin: elimina un lead
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const guard = await requireAuth();
  if (guard) return guard;
  const { id } = await ctx.params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const rows = await db()(
      `DELETE FROM leads WHERE id = $1 RETURNING id`,
      [Number(id)]
    );
    if (!rows.length) {
      return NextResponse.json({ error: "Lead no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando lead:", err);
    return NextResponse.json(
      { error: "No se pudo eliminar el lead" },
      { status: 500 }
    );
  }
}