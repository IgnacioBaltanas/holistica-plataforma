import { prisma } from "@/lib/prisma";
import { sendPaymentConfirmationEmail, sendQREmail } from "@/lib/email";
import QRCode from "qrcode";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function confirmarPedido(pedidoId: string) {
  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      cliente: { select: { nombre: true, email: true } },
      seccion: { select: { nombre: true } },
      producto: { select: { nombre: true } },
    },
  });

  if (!pedido || pedido.estadoPago === "CONFIRMADO") return;

  const nombreProducto = pedido.seccion?.nombre || pedido.producto?.nombre || pedido.tipo;

  // Update payment status
  await prisma.pedido.update({
    where: { id: pedidoId },
    data: {
      estadoPago: "CONFIRMADO",
      estadoEntrega: pedido.tipo === "ENTRADA" ? "QR_ENVIADO" : "ENTREGADO",
      paidAt: new Date(),
      deliveredAt: pedido.tipo !== "ENTRADA" && pedido.tipo !== "SESION" ? new Date() : undefined,
    },
  });

  // === ENTRADA: Generate QR and create entry ===
  if (pedido.tipo === "ENTRADA" && pedido.eventoId) {
    const existingEntry = await prisma.entrada.findFirst({
      where: { eventoId: pedido.eventoId, clienteId: pedido.clienteId },
    });

    if (!existingEntry) {
      const entrada = await prisma.entrada.create({
        data: {
          eventoId: pedido.eventoId,
          clienteId: pedido.clienteId,
        },
      });

      // Generate QR image
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      const qrUrl = `${baseUrl}/validar/${entrada.codigoQr}`;
      const qrBuffer = await QRCode.toBuffer(qrUrl, {
        type: "png",
        width: 400,
        margin: 2,
        color: { dark: "#1f2937", light: "#ffffff" },
      });

      // Save QR image
      const qrDir = path.join(process.cwd(), "uploads", "qr");
      await mkdir(qrDir, { recursive: true });
      const qrFilename = `${entrada.codigoQr}.png`;
      await writeFile(path.join(qrDir, qrFilename), qrBuffer);

      const qrPath = `/api/admin/files/qr/${qrFilename}`;

      await prisma.entrada.update({
        where: { id: entrada.id },
        data: { imagenQr: qrPath },
      });

      // Send QR via email
      const evento = await prisma.evento.findUnique({ where: { id: pedido.eventoId } });
      if (evento && pedido.cliente.email) {
        await sendQREmail({
          to: pedido.cliente.email,
          nombre: pedido.cliente.nombre,
          evento: evento.nombre,
          fecha: new Date(evento.fecha).toLocaleDateString("es-AR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            timeZone: "UTC",
          }) + ` - ${evento.horaInicio}hs`,
          lugar: evento.lugar || "A confirmar",
          qrBuffer,
        });
      }

      // Check if event is now full
      const totalEntradas = await prisma.entrada.count({
        where: { eventoId: pedido.eventoId, estado: { not: "CANCELADA" } },
      });
      if (evento && totalEntradas >= evento.cupoMaximo) {
        await prisma.evento.update({
          where: { id: evento.id },
          data: { estado: "AGOTADO" },
        });
      }
    }
  }

  // Send confirmation email for all types
  if (pedido.cliente.email) {
    await sendPaymentConfirmationEmail({
      to: pedido.cliente.email,
      nombre: pedido.cliente.nombre,
      producto: nombreProducto,
      pedidoId,
    });
  }
}
