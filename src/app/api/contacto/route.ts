import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, email, mensaje } = body;

    if (!nombre || !email || !mensaje) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son obligatorios" },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Email invalido" },
        { status: 400 }
      );
    }

    // If user is logged in, create ticket linked to their account
    const session = await getSession();
    let ticketId: string | null = null;

    if (session?.userId) {
      const ticket = await prisma.ticket.create({
        data: {
          clienteId: session.userId,
          canal: "web",
          tipo: "CONSULTA",
          descripcion: mensaje,
        },
      });
      ticketId = ticket.id;
    }

    // Notify admin via email
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const escapedNombre = nombre.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedEmail = email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const escapedMensaje = mensaje.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

      await sendEmail({
        to: adminEmail,
        subject: `Nuevo mensaje de contacto - ${nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nuevo mensaje de contacto</h2>
            <p><strong>Nombre:</strong> ${escapedNombre}</p>
            <p><strong>Email:</strong> ${escapedEmail}</p>
            <p><strong>Mensaje:</strong></p>
            <blockquote style="border-left: 3px solid #7c3aed; padding-left: 12px; color: #374151;">${escapedMensaje}</blockquote>
            ${ticketId ? `<p style="color: #999; font-size: 11px;">Ticket #${ticketId.slice(0, 8)}</p>` : `<p style="color: #999; font-size: 11px;">Usuario no registrado</p>`}
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("Error en contacto:", e);
    return NextResponse.json(
      { error: "Error procesando mensaje" },
      { status: 500 }
    );
  }
}
