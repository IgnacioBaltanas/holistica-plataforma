import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { consulta, fechaNacimiento, tipoTirada, notas } = await request.json();

    if (!consulta || !tipoTirada) {
      return NextResponse.json(
        { error: "La consulta y el tipo de tirada son obligatorios" },
        { status: 400 }
      );
    }

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: session.userId,
        tipo: "TIRADA",
        monto: null,
        moneda: "ARS",
        estadoPago: "PENDIENTE",
        estadoEntrega: "PENDIENTE",
        canalCompra: "web",
        notas: consulta,
        datosExtra: {
          fechaNacimiento: fechaNacimiento || null,
          tipoTirada,
          notasAdicionales: notas || null,
        },
      },
    });

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
      await sendEmail({
        to: adminEmail,
        subject: `Nueva solicitud de tirada - ${session.nombre}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Nueva solicitud de tirada</h2>
            <p><strong>Cliente:</strong> ${session.nombre} (${session.email})</p>
            <p><strong>Tipo:</strong> ${tipoTirada}</p>
            ${fechaNacimiento ? `<p><strong>Fecha de nacimiento:</strong> ${fechaNacimiento}</p>` : ""}
            <p><strong>Consulta:</strong></p>
            <blockquote style="border-left: 3px solid #7c3aed; padding-left: 12px; color: #374151;">${consulta.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</blockquote>
            ${notas ? `<p><strong>Notas adicionales:</strong> ${notas.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>` : ""}
            <a href="${baseUrl}/admin/tiradas/${pedido.id}"
              style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none; margin-top: 16px;">
              Ver solicitud
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json({ pedidoId: pedido.id }, { status: 201 });
  } catch (e) {
    console.error("Error creando tirada:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
