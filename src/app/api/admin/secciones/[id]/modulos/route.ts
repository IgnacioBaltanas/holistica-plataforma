import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const { nombre, descripcion } = await request.json();

  if (!nombre) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  const maxOrden = await prisma.modulo.aggregate({
    where: { seccionId: id },
    _max: { orden: true },
  });

  const modulo = await prisma.modulo.create({
    data: {
      seccionId: id,
      nombre,
      descripcion: descripcion || null,
      orden: (maxOrden._max.orden ?? -1) + 1,
    },
  });

  return NextResponse.json(modulo, { status: 201 });
}
