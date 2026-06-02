import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { seccionId, nombre, fecha, horaInicio, horaFin, lugar, cupoMaximo, precioArs, precioUsd } = await request.json();

  if (!seccionId || !nombre || !fecha || !horaInicio || !cupoMaximo) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const evento = await prisma.evento.create({
    data: {
      seccionId,
      nombre,
      fecha: new Date(fecha),
      horaInicio,
      horaFin: horaFin || null,
      lugar: lugar || null,
      cupoMaximo: parseInt(cupoMaximo),
      precioArs: precioArs ? parseFloat(precioArs) : null,
      precioUsd: precioUsd ? parseFloat(precioUsd) : null,
    },
  });

  return NextResponse.json({ id: evento.id }, { status: 201 });
}
