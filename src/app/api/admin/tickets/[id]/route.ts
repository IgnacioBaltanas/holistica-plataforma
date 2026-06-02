import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { estado, respuesta } = await request.json();

  const data: Record<string, unknown> = {};
  if (estado) data.estado = estado;
  if (respuesta !== undefined) data.respuesta = respuesta;
  if (estado === "RESUELTO") data.resolvedAt = new Date();

  await prisma.ticket.update({ where: { id }, data });

  return NextResponse.json({ ok: true });
}
