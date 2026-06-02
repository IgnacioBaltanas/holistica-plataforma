import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentApi } from "@/lib/mercadopago";
import { confirmarPedido } from "@/lib/confirmar-pedido";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MP sends different notification types
    if (body.type !== "payment" && body.action !== "payment.updated") {
      return NextResponse.json({ ok: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ ok: true });
    }

    const payment = await paymentApi.get({ id: paymentId });

    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true });
    }

    const pedidoId = payment.external_reference;
    if (!pedidoId) {
      return NextResponse.json({ ok: true });
    }

    const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
    if (!pedido || pedido.estadoPago === "CONFIRMADO") {
      return NextResponse.json({ ok: true });
    }

    await confirmarPedido(pedidoId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error en webhook MP:", e);
    return NextResponse.json({ error: "Error procesando webhook" }, { status: 500 });
  }
}
