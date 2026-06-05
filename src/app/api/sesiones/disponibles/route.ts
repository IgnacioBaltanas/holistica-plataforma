import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DURACION_SERVICIO: Record<string, number> = {
  tarot: 60,
  meditacion: 45,
  coaching: 60,
};

const BUFFER_MINUTOS = 15;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// GET /api/sesiones/disponibles?fecha=2026-06-10&servicio=tarot
export async function GET(request: NextRequest) {
  const fecha = request.nextUrl.searchParams.get("fecha");
  const servicio = request.nextUrl.searchParams.get("servicio");

  if (!fecha || !servicio) {
    return NextResponse.json(
      { error: "fecha y servicio son obligatorios" },
      { status: 400 }
    );
  }

  const duracion = DURACION_SERVICIO[servicio] || 60;
  const fechaDate = new Date(fecha + "T00:00:00Z");
  const diaSemana = fechaDate.getUTCDay(); // 0=domingo

  // Check if this day of week has availability
  const disponibilidad = await prisma.disponibilidad.findUnique({
    where: { diaSemana },
  });

  if (!disponibilidad || !disponibilidad.activo) {
    return NextResponse.json({ slots: [] });
  }

  // Check if date is blocked
  const bloqueada = await prisma.fechaBloqueada.findUnique({
    where: { fecha: fechaDate },
  });

  if (bloqueada) {
    return NextResponse.json({ slots: [] });
  }

  // Get already booked sessions for this date
  const sesionesDelDia = await prisma.sesionAgendada.findMany({
    where: {
      fecha: fechaDate,
      estado: { in: ["CONFIRMADA", "COMPLETADA"] },
    },
    select: { horaInicio: true, horaFin: true },
  });

  const ocupados = sesionesDelDia.map((s) => ({
    inicio: timeToMinutes(s.horaInicio),
    fin: timeToMinutes(s.horaFin) + BUFFER_MINUTOS,
  }));

  // Generate available slots
  const inicioDisp = timeToMinutes(disponibilidad.horaInicio);
  const finDisp = timeToMinutes(disponibilidad.horaFin);
  const slots: { horaInicio: string; horaFin: string }[] = [];

  for (let t = inicioDisp; t + duracion <= finDisp; t += 30) {
    const slotInicio = t;
    const slotFin = t + duracion;

    // Check overlap with existing sessions
    const overlap = ocupados.some(
      (o) => slotInicio < o.fin && slotFin + BUFFER_MINUTOS > o.inicio
    );

    if (!overlap) {
      slots.push({
        horaInicio: minutesToTime(slotInicio),
        horaFin: minutesToTime(slotFin),
      });
    }
  }

  return NextResponse.json({ slots, duracion });
}
