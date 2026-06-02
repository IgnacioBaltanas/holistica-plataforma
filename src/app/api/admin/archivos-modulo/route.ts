import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { moduloId, nombre, tipo, rutaStorage, tamanoBytes } = await request.json();

  if (!moduloId || !nombre || !tipo || !rutaStorage) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const maxOrden = await prisma.archivoModulo.aggregate({
    where: { moduloId },
    _max: { orden: true },
  });

  const archivo = await prisma.archivoModulo.create({
    data: {
      moduloId,
      nombre,
      tipo,
      rutaStorage,
      tamanoBytes: tamanoBytes ? BigInt(tamanoBytes) : null,
      orden: (maxOrden._max.orden ?? -1) + 1,
    },
  });

  return NextResponse.json({ id: archivo.id }, { status: 201 });
}
