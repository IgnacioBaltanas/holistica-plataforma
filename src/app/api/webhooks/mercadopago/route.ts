import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymentApi } from "@/lib/mercadopago";
import { confirmarPedido } from "@/lib/confirmar-pedido";
import crypto from "crypto";

function verifyMPSignature(request: NextRequest, body: string): boolean {
  const mpSecret = process.env.MP_WEBHOOK_SECRET;
  if (!mpSecret) {
    console.warn("[MP Webhook] MP_WEBHOOK_SECRET no configurado — rechazando request");
    return false;
  }

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  if (!xSignature || !xRequestId) return false;

  // Parse x-signature header: "ts=...,v1=..."
  const parts: Record<string, string> = {};
  for (const part of xSignature.split(",")) {
    const [key, value] = part.split("=", 2);
    if (key && value) parts[key.trim()] = value.trim();
  }

  const ts = parts["ts"];
  const v1 = parts["v1"];
  if (!ts || !v1) return false;

  // Parse data_id from query string (MP sends it as ?data.id=xxx)
  const dataId = request.nextUrl.searchParams.get("data.id") || "";

  // Build the manifest string as MP specifies
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const hmac = crypto.createHmac("sha256", mpSecret).update(manifest).digest("hex");

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(v1));
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    // Verify webhook signature from Mercado Pago
    if (!verifyMPSignature(request, rawBody)) {
      console.warn("[MP Webhook] Firma invalida — request rechazado");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

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
