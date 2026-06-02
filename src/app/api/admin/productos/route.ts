import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { nombre, descripcion, precioArs, precioUsd, tipo, rutaStorage, imagenPreview } = await request.json();

  if (!nombre || !tipo || !rutaStorage) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  const producto = await prisma.productoArchivo.create({
    data: {
      nombre,
      descripcion: descripcion || null,
      precioArs: precioArs ? parseFloat(precioArs) : null,
      precioUsd: precioUsd ? parseFloat(precioUsd) : null,
      tipo,
      rutaStorage,
      imagenPreview: imagenPreview || null,
    },
  });

  return NextResponse.json({ id: producto.id }, { status: 201 });
}
