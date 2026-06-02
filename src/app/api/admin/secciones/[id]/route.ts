import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const seccion = await prisma.seccion.findUnique({ where: { id } });
  if (!seccion) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  const data: Record<string, unknown> = {};

  if (body.nombre !== undefined) data.nombre = body.nombre;
  if (body.descripcion !== undefined) data.descripcion = body.descripcion;
  if (body.precioArs !== undefined) data.precioArs = body.precioArs ? parseFloat(body.precioArs) : null;
  if (body.precioUsd !== undefined) data.precioUsd = body.precioUsd ? parseFloat(body.precioUsd) : null;
  if (body.imagenPortada !== undefined) data.imagenPortada = body.imagenPortada;
  if (body.contenidoHtml !== undefined) data.contenidoHtml = body.contenidoHtml;
  if (body.contenidoCss !== undefined) data.contenidoCss = body.contenidoCss;
  if (body.datosEditor !== undefined) data.datosEditor = body.datosEditor;

  if (body.estado !== undefined) {
    data.estado = body.estado;
    if (body.estado === "PUBLICADO" && !seccion.publishedAt) {
      data.publishedAt = new Date();
    }
  }

  await prisma.seccion.update({ where: { id }, data });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.seccion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
