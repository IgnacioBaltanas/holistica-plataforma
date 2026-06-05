import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sendEmail } from "@/lib/email";

const DURACION_SERVICIO: Record<string, number> = {
  tarot: 60,
  meditacion: 45,
  coaching: 60,
};

const NOMBRE_SERVICIO: Record<string, string> = {
  tarot: "Tarot - Tirada personalizada",
  meditacion: "Meditacion guiada",
  coaching: "Coaching personal",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { pedidoId, fecha, horaInicio, modalidad, notas } = await request.json();

    if (!pedidoId || !fecha || !horaInicio || !modalidad) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    // Verify pedido belongs to user, is SESION, and is paid
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { sesion: true },
    });

    if (!pedido || pedido.clienteId !== session.userId) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
    }

    if (pedido.tipo !== "SESION") {
      return NextResponse.json({ error: "Este pedido no es una sesion" }, { status: 400 });
    }

    if (pedido.estadoPago !== "CONFIRMADO") {
      return NextResponse.json({ error: "El pago no esta confirmado" }, { status: 400 });
    }

    if (pedido.sesion) {
      return NextResponse.json({ error: "Ya agendaste esta sesion" }, { status: 409 });
    }

    // Determine service type from datosExtra or default
    const datos = pedido.datosExtra as Record<string, string> | null;
    const tipoServicio = datos?.tipoServicio || "tarot";
    const duracion = DURACION_SERVICIO[tipoServicio] || 60;

    // Calculate end time
    const [h, m] = horaInicio.split(":").map(Number);
    const finMinutes = h * 60 + m + duracion;
    const horaFin = `${Math.floor(finMinutes / 60).toString().padStart(2, "0")}:${(finMinutes % 60).toString().padStart(2, "0")}`;

    const fechaDate = new Date(fecha + "T00:00:00Z");

    // Check no overlap
    const conflicto = await prisma.sesionAgendada.findFirst({
      where: {
        fecha: fechaDate,
        estado: "CONFIRMADA",
        OR: [
          { horaInicio: { lt: horaFin }, horaFin: { gt: horaInicio } },
        ],
      },
    });

    if (conflicto) {
      return NextResponse.json({ error: "Ese horario ya no esta disponible" }, { status: 409 });
    }

    // Create session
    const sesion = await prisma.sesionAgendada.create({
      data: {
        pedidoId,
        clienteId: session.userId,
        tipoServicio,
        fecha: fechaDate,
        horaInicio,
        horaFin,
        duracion,
        modalidad,
        notas: notas || null,
      },
    });

    // Update pedido status
    await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estadoEntrega: "AGENDADO" },
    });

    // Send confirmation emails
    const nombreServicio = NOMBRE_SERVICIO[tipoServicio] || tipoServicio;
    const fechaStr = fechaDate.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    });

    try {
      await sendEmail({
        to: session.email,
        subject: `Sesion agendada - ${nombreServicio}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Sesion confirmada!</h2>
            <p>Hola ${session.nombre},</p>
            <p>Tu sesion de <strong>${nombreServicio}</strong> quedo agendada:</p>
            <p><strong>Fecha:</strong> ${fechaStr}</p>
            <p><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
            <p><strong>Modalidad:</strong> ${modalidad === "virtual" ? "Virtual (el link de Meet se enviara antes de la sesion)" : "Presencial"}</p>
            <p>Te enviaremos un recordatorio 24 horas antes.</p>
            <br/>
            <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error("[agendar] Error enviando email:", emailErr);
    }

    // Notify admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: `Nueva sesion agendada - ${session.nombre} - ${nombreServicio}`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Nueva sesion agendada</h2>
              <p><strong>Cliente:</strong> ${session.nombre} (${session.email})</p>
              <p><strong>Servicio:</strong> ${nombreServicio}</p>
              <p><strong>Fecha:</strong> ${fechaStr}</p>
              <p><strong>Horario:</strong> ${horaInicio} - ${horaFin}</p>
              <p><strong>Modalidad:</strong> ${modalidad}</p>
              ${notas ? `<p><strong>Notas:</strong> ${notas}</p>` : ""}
            </div>
          `,
        });
      } catch (emailErr) {
        console.error("[agendar] Error notificando admin:", emailErr);
      }
    }

    return NextResponse.json({ sesionId: sesion.id }, { status: 201 });
  } catch (e) {
    console.error("Error agendando sesion:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
