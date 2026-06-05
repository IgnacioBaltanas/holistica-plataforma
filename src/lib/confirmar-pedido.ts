import { prisma } from "@/lib/prisma";
import { sendEmail, sendPaymentConfirmationEmail, sendQREmail } from "@/lib/email";
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
      estadoEntrega: pedido.tipo === "ENTRADA" ? "QR_ENVIADO"
        : pedido.tipo === "SESION" ? "PENDIENTE"
        : "ENTREGADO",
      paidAt: new Date(),
      deliveredAt: pedido.tipo !== "ENTRADA" && pedido.tipo !== "SESION" ? new Date() : undefined,
    },
  });

  // === ENTRADA: Generate QR and create entry ===
  if (pedido.tipo === "ENTRADA" && pedido.eventoId) {
    try {
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
        try {
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
        } catch (emailErr) {
          console.error(`[confirmarPedido] Error enviando QR email para pedido ${pedidoId}:`, emailErr);
        }
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
    } catch (entradaErr) {
      // UNIQUE constraint violation means entry already exists — not an error
      if (entradaErr instanceof Error && entradaErr.message.includes("Unique constraint")) {
        console.warn(`[confirmarPedido] Entrada ya existe para cliente ${pedido.clienteId} en evento ${pedido.eventoId}`);
      } else {
        console.error(`[confirmarPedido] Error creando entrada para pedido ${pedidoId}:`, entradaErr);
        throw entradaErr;
      }
    }
  }

  // Send confirmation email for all types
  if (pedido.cliente.email) {
    try {
      if (pedido.tipo === "SESION") {
        // For sessions, send email with link to schedule
        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
        await sendEmail({
          to: pedido.cliente.email,
          subject: `Pago confirmado - Agenda tu sesion`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Pago confirmado!</h2>
              <p>Hola ${pedido.cliente.nombre},</p>
              <p>Confirmamos tu pago para <strong>${nombreProducto}</strong>.</p>
              <p>Ahora podes elegir dia y horario para tu sesion:</p>
              <a href="${baseUrl}/agendar/${pedidoId}"
                style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 16px 0;">
                Agendar mi sesion
              </a>
              <br/>
              <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
            </div>
          `,
        });
      } else {
        await sendPaymentConfirmationEmail({
          to: pedido.cliente.email,
          nombre: pedido.cliente.nombre,
          producto: nombreProducto,
          pedidoId,
        });
      }
    } catch (emailErr) {
      console.error(`[confirmarPedido] Error enviando email confirmacion para pedido ${pedidoId}:`, emailErr);
    }
  }
}
