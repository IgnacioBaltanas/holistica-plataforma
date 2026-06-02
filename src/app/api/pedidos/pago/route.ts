import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { preferenceApi, isMPConfigured } from "@/lib/mercadopago";
import { sendAdminPaymentAlert } from "@/lib/email";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const formData = await request.formData();
    const pedidoId = formData.get("pedidoId") as string;
    const metodo = formData.get("metodo") as string;
    const comprobanteFile = formData.get("comprobante") as File | null;

    if (!pedidoId || !metodo) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId, clienteId: session.userId },
      include: { seccion: { select: { nombre: true } } },
    });

    if (!pedido) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.estadoPago === "CONFIRMADO") {
      return NextResponse.json({ error: "Ya esta pagado" }, { status: 409 });
    }

    // === MERCADO PAGO ===
    if (metodo === "mercadopago") {
      if (!isMPConfigured()) {
        return NextResponse.json({ error: "Mercado Pago no esta configurado" }, { status: 501 });
      }

      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const monto = pedido.monto ? Number(pedido.monto) : 0;

      const preference = await preferenceApi.create({
        body: {
          items: [
            {
              id: pedido.id,
              title: pedido.seccion?.nombre || `Pedido #${pedido.id.slice(0, 8)}`,
              quantity: 1,
              unit_price: monto,
              currency_id: "ARS",
            },
          ],
          external_reference: pedido.id,
          back_urls: {
            success: `${baseUrl}/mi-cuenta/pedidos`,
            failure: `${baseUrl}/checkout/${pedido.id}`,
            pending: `${baseUrl}/mi-cuenta/pedidos`,
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/webhooks/mercadopago`,
        },
      });

      await prisma.pedido.update({
        where: { id: pedidoId },
        data: { metodoPago: "mercadopago" },
      });

      return NextResponse.json({ redirectUrl: preference.init_point });
    }

    // === PREX / TRANSFERENCIA (flujo manual con comprobante) ===
    if (metodo === "prex" || metodo === "transferencia") {
      if (!comprobanteFile) {
        return NextResponse.json({ error: "Adjunta el comprobante de pago" }, { status: 400 });
      }

      const compPath = await saveComprobante(pedidoId, comprobanteFile);

      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          metodoPago: metodo,
          comprobante: compPath,
        },
      });

      // Send alert to admin
      const cliente = await prisma.usuario.findUnique({
        where: { id: session.userId },
        select: { nombre: true, email: true },
      });

      if (cliente) {
        await sendAdminPaymentAlert({
          clienteNombre: cliente.nombre,
          clienteEmail: cliente.email,
          producto: pedido.seccion?.nombre || `Pedido #${pedidoId.slice(0, 8)}`,
          monto: pedido.monto ? Number(pedido.monto) : 0,
          moneda: pedido.moneda,
          metodoPago: metodo,
          pedidoId,
        });
      }

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Metodo de pago invalido" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

async function saveComprobante(pedidoId: string, file: File): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "uploads", "comprobantes");
  await mkdir(uploadsDir, { recursive: true });

  const ext = file.name.split(".").pop() || "jpg";
  const filename = `${pedidoId}.${ext}`;
  const filepath = path.join(uploadsDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/api/admin/files/comprobantes/${filename}`;
}
