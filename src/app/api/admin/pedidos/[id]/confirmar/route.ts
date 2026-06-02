import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { confirmarPedido } from "@/lib/confirmar-pedido";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (pedido.estadoPago === "CONFIRMADO") {
    return NextResponse.json({ error: "Ya esta confirmado" }, { status: 409 });
  }

  await confirmarPedido(id);

  return NextResponse.json({ ok: true });
}
