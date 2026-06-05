import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { sendEmail } from "@/lib/email";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { estado, respuesta } = await request.json();

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { cliente: { select: { nombre: true, email: true } } },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket no encontrado" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (estado) data.estado = estado;
    if (respuesta !== undefined) data.respuesta = respuesta;
    if (estado === "RESUELTO") data.resolvedAt = new Date();

    await prisma.ticket.update({ where: { id }, data });

    // Send email to client when a response is written
    if (respuesta && ticket.cliente.email) {
      const escapedResp = respuesta.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
      const estadoLabel = estado === "RESUELTO" ? "resuelto" : "actualizado";

      try {
        await sendEmail({
          to: ticket.cliente.email,
          subject: `Respuesta a tu consulta #${id.slice(0, 8)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Respuesta a tu consulta</h2>
              <p>Hola ${ticket.cliente.nombre},</p>
              <p>Tu consulta fue ${estadoLabel}. Esta es la respuesta:</p>
              <blockquote style="border-left: 3px solid #7c3aed; padding-left: 12px; color: #374151; margin: 16px 0;">
                ${escapedResp}
              </blockquote>
              <p style="color: #6b7280; font-size: 12px;">Consulta original: ${ticket.descripcion.slice(0, 100)}${ticket.descripcion.length > 100 ? "..." : ""}</p>
              <br/>
              <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.error(`[ticket] Error enviando email respuesta para ticket ${id}:`, emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error actualizando ticket:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
