import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// This endpoint should be called by an external cron job (e.g., every hour)
// GET /api/cron/recordatorios?key=CRON_SECRET
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || key !== cronSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const ahora = new Date();
    const en24h = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
    const en25h = new Date(ahora.getTime() + 25 * 60 * 60 * 1000);

    // Find sessions happening in ~24 hours
    const sesionesProximas = await prisma.sesionAgendada.findMany({
      where: {
        estado: "CONFIRMADA",
        fecha: {
          gte: new Date(en24h.toISOString().split("T")[0] + "T00:00:00Z"),
          lte: new Date(en25h.toISOString().split("T")[0] + "T23:59:59Z"),
        },
      },
      include: {
        cliente: { select: { nombre: true, email: true } },
      },
    });

    let enviados = 0;

    for (const sesion of sesionesProximas) {
      if (!sesion.cliente.email) continue;

      const fechaStr = new Date(sesion.fecha).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "UTC",
      });

      try {
        await sendEmail({
          to: sesion.cliente.email,
          subject: `Recordatorio: tu sesion de ${sesion.tipoServicio} es manana`,
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #7c3aed;">Recordatorio de sesion</h2>
              <p>Hola ${sesion.cliente.nombre},</p>
              <p>Te recordamos que manana tenes tu sesion de <strong>${sesion.tipoServicio}</strong>:</p>
              <p><strong>Fecha:</strong> ${fechaStr}</p>
              <p><strong>Horario:</strong> ${sesion.horaInicio} - ${sesion.horaFin}</p>
              <p><strong>Modalidad:</strong> ${sesion.modalidad === "virtual" ? "Virtual" : "Presencial"}</p>
              ${sesion.meetLink ? `<p><a href="${sesion.meetLink}" style="color: #7c3aed; font-weight: 600;">Link de la sesion</a></p>` : ""}
              ${sesion.lugar ? `<p><strong>Lugar:</strong> ${sesion.lugar}</p>` : ""}
              <br/>
              <p style="color: #999; font-size: 11px;">Holistica - Bienestar y Crecimiento Personal</p>
            </div>
          `,
        });
        enviados++;
      } catch (emailErr) {
        console.error(`[recordatorio] Error enviando a ${sesion.cliente.email}:`, emailErr);
      }
    }

    return NextResponse.json({
      ok: true,
      sesionesEncontradas: sesionesProximas.length,
      recordatoriosEnviados: enviados,
    });
  } catch (e) {
    console.error("Error en cron recordatorios:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
