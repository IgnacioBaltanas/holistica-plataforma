import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getTemplateHtml } from "@/lib/templates";

export async function POST(request: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { nombre, template, descripcion, precioArs, precioUsd } = body;

  if (!nombre || !template) {
    return NextResponse.json({ error: "Nombre y template son requeridos" }, { status: 400 });
  }

  const slug = nombre
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Ensure unique slug
  let finalSlug = slug;
  let counter = 1;
  while (await prisma.seccion.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${slug}-${counter++}`;
  }

  const contenidoHtml = getTemplateHtml(template, nombre, descripcion || "");

  const seccion = await prisma.seccion.create({
    data: {
      nombre,
      slug: finalSlug,
      template,
      descripcion: descripcion || null,
      precioArs: precioArs ? parseFloat(precioArs) : null,
      precioUsd: precioUsd ? parseFloat(precioUsd) : null,
      contenidoHtml: contenidoHtml || null,
      estado: "BORRADOR",
    },
  });

  return NextResponse.json({ id: seccion.id, slug: seccion.slug }, { status: 201 });
}
