import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

// Called daily by external cron (e.g., every day at 9:00 AM)
// GET /api/cron/resumen-diario?key=CRON_SECRET
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || key !== cronSecret) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    return NextResponse.json({ error: "ADMIN_EMAIL no configurado" }, { status: 500 });
  }

  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const ayer = new Date(hoy.getTime() - 24 * 60 * 60 * 1000);

    const [
      pedidosAyer,
      pedidosPendientes,
      ticketsAbiertos,
      sesionesHoy,
      tiradasPendientes,
      clientesTotal,
      ventasMes,
    ] = await Promise.all([
      // Orders created yesterday
      prisma.pedido.count({
        where: { createdAt: { gte: ayer, lt: hoy } },
      }),
      // Pending payments
      prisma.pedido.count({
        where: { estadoPago: "PENDIENTE" },
      }),
      // Open tickets
      prisma.ticket.count({
        where: { estado: { in: ["ABIERTO", "EN_REVISION"] } },
      }),
      // Sessions today
      prisma.sesionAgendada.count({
        where: {
          fecha: { gte: hoy, lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000) },
          estado: "CONFIRMADA",
        },
      }),
      // Pending tiradas
      prisma.pedido.count({
        where: { tipo: "TIRADA", estadoEntrega: { in: ["PENDIENTE", "EN_PREPARACION"] } },
      }),
      // Total clients
      prisma.usuario.count({ where: { role: "CLIENTE" } }),
      // Sales this month
      prisma.pedido.count({
        where: {
          estadoPago: "CONFIRMADO",
          paidAt: { gte: new Date(hoy.getFullYear(), hoy.getMonth(), 1) },
        },
      }),
    ]);

    // Get today's sessions details
    const sesionesDetalle = await prisma.sesionAgendada.findMany({
      where: {
        fecha: { gte: hoy, lt: new Date(hoy.getTime() + 24 * 60 * 60 * 1000) },
        estado: "CONFIRMADA",
      },
      include: { cliente: { select: { nombre: true } } },
      orderBy: { horaInicio: "asc" },
    });

    const sesionesHtml = sesionesDetalle.length > 0
      ? sesionesDetalle.map((s) =>
          `<li>${s.horaInicio} - ${s.horaFin} | ${s.cliente.nombre} | ${s.tipoServicio} (${s.modalidad})</li>`
        ).join("")
      : "<li>No hay sesiones hoy</li>";

    const fechaStr = hoy.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    await sendEmail({
      to: adminEmail,
      subject: `Resumen diario - ${fechaStr}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Resumen del dia</h2>
          <p style="color: #6b7280;">${fechaStr}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Pedidos ayer</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right;">${pedidosAyer}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Pagos pendientes de confirmar</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; ${pedidosPendientes > 0 ? "color: #d97706;" : ""}">${pedidosPendientes}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Tickets abiertos</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; ${ticketsAbiertos > 0 ? "color: #dc2626;" : ""}">${ticketsAbiertos}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Tiradas por entregar</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; ${tiradasPendientes > 0 ? "color: #d97706;" : ""}">${tiradasPendientes}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Sesiones hoy</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right;">${sesionesHoy}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 10px 0; color: #6b7280;">Ventas del mes</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right; color: #059669;">${ventasMes}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Clientes totales</td>
              <td style="padding: 10px 0; font-weight: 600; text-align: right;">${clientesTotal}</td>
            </tr>
          </table>

          ${sesionesHoy > 0 ? `
            <h3 style="color: #374151; margin-top: 24px;">Agenda de hoy</h3>
            <ul style="color: #374151; padding-left: 20px;">${sesionesHtml}</ul>
          ` : ""}

          <div style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/admin"
              style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; text-decoration: none;">
              Ir al panel admin
            </a>
          </div>

          <p style="color: #9ca3af; font-size: 11px; margin-top: 32px;">
            Este resumen se envia automaticamente todos los dias a las 9:00 AM.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      resumen: { pedidosAyer, pedidosPendientes, ticketsAbiertos, sesionesHoy, tiradasPendientes, ventasMes, clientesTotal },
    });
  } catch (e) {
    console.error("Error en resumen diario:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
