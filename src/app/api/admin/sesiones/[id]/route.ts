import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// PUT: update session (status, meet link, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const sesion = await prisma.sesionAgendada.findUnique({
      where: { id },
      include: { cliente: { select: { nombre: true, email: true } } },
    });

    if (!sesion) {
      return NextResponse.json({ error: "Sesion no encontrada" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.estado) data.estado = body.estado;
    if (body.meetLink !== undefined) data.meetLink = body.meetLink || null;
    if (body.lugar !== undefined) data.lugar = body.lugar || null;

    const updated = await prisma.sesionAgendada.update({
      where: { id },
      data,
    });

    // If meet link was added, notify client
    if (body.meetLink && !sesion.meetLink && sesion.cliente.email) {
      const fechaStr = new Date(sesion.fecha).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });

      try {
        await sendEmail({
          to: sesion.cliente.email,
          subject: `Link para tu sesion - ${sesion.tipoServicio}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Link de tu sesion</h2>
              <p>Hola ${sesion.cliente.nombre},</p>
              <p>Tu sesion del <strong>${fechaStr}</strong> a las <strong>${sesion.horaInicio}</strong> ya tiene link de conexion:</p>
              <a href="${body.meetLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 14px 28px; border-radius: 8px; font-weight: 600; text-decoration: none; margin: 16px 0;">
                Unirme a la sesion
              </a>
              <br/>
              <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[sesion] Error enviando meet link:", emailErr);
      }
    }

    // If session was completed, update pedido
    if (body.estado === "COMPLETADA" && sesion.pedidoId) {
      await prisma.pedido.update({
        where: { id: sesion.pedidoId },
        data: { estadoEntrega: "ENTREGADO", deliveredAt: new Date() },
      });
    }

    return NextResponse.json(updated);
  } catch (e) {
    console.error("Error actualizando sesion:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
