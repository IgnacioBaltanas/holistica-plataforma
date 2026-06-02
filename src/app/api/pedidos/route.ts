import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { seccionId, tipo } = await request.json();

    if (!seccionId || !tipo) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const seccion = await prisma.seccion.findUnique({
      where: { id: seccionId, estado: "PUBLICADO" },
      include: { evento: true },
    });

    if (!seccion) {
      return NextResponse.json({ error: "Seccion no encontrada" }, { status: 404 });
    }

    // Check if already purchased
    const pedidoExistente = await prisma.pedido.findFirst({
      where: {
        clienteId: session.userId,
        seccionId: seccion.id,
        estadoPago: { in: ["PENDIENTE", "CONFIRMADO"] },
      },
    });

    if (pedidoExistente) {
      if (pedidoExistente.estadoPago === "CONFIRMADO") {
        return NextResponse.json({ error: "Ya compraste este contenido" }, { status: 409 });
      }
      // Return existing pending order
      return NextResponse.json({ pedidoId: pedidoExistente.id });
    }

    // For events, check capacity
    if (seccion.evento) {
      const entradasVendidas = await prisma.entrada.count({
        where: { eventoId: seccion.evento.id, estado: { not: "CANCELADA" } },
      });
      if (entradasVendidas >= seccion.evento.cupoMaximo) {
        return NextResponse.json({ error: "Evento agotado" }, { status: 409 });
      }
    }

    const monto = seccion.precioArs;
    const tipoPedido = tipo === "ENTRADA" ? "ENTRADA" : "CURSO";

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: session.userId,
        tipo: tipoPedido,
        seccionId: seccion.id,
        eventoId: seccion.evento?.id || undefined,
        monto: monto,
        moneda: "ARS",
        estadoPago: "PENDIENTE",
        estadoEntrega: "PENDIENTE",
        canalCompra: "web",
      },
    });

    return NextResponse.json({ pedidoId: pedido.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
