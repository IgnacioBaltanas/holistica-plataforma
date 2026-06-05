import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// GET: return current availability schedule
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const disponibilidad = await prisma.disponibilidad.findMany({
    orderBy: { diaSemana: "asc" },
  });

  return NextResponse.json(disponibilidad);
}

// PUT: replace entire availability schedule
export async function PUT(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { dias } = await request.json();

    if (!Array.isArray(dias)) {
      return NextResponse.json({ error: "Formato invalido" }, { status: 400 });
    }

    // Delete all existing and recreate
    await prisma.disponibilidad.deleteMany();

    const records = [];
    for (const dia of dias) {
      if (dia.activo && dia.horaInicio && dia.horaFin) {
        records.push({
          diaSemana: dia.diaSemana,
          horaInicio: dia.horaInicio,
          horaFin: dia.horaFin,
          activo: true,
        });
      }
    }

    if (records.length > 0) {
      await prisma.disponibilidad.createMany({ data: records });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Error actualizando disponibilidad:", e);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
