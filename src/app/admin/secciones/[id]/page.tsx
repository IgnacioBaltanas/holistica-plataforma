import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import SeccionEditor from "@/components/admin/SeccionEditor";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = await prisma.seccion.findUnique({ where: { id }, select: { nombre: true } });
  return { title: s ? `Editar: ${s.nombre}` : "Seccion" };
}

export default async function EditarSeccionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seccion = await prisma.seccion.findUnique({
    where: { id },
    include: {
      modulos: {
        orderBy: { orden: "asc" },
        include: { archivos: { orderBy: { orden: "asc" } } },
      },
      evento: true,
    },
  });

  if (!seccion) notFound();

  // Serialize for client component
  const data = {
    id: seccion.id,
    nombre: seccion.nombre,
    slug: seccion.slug,
    template: seccion.template,
    descripcion: seccion.descripcion || "",
    imagenPortada: seccion.imagenPortada || "",
    precioArs: seccion.precioArs ? String(seccion.precioArs) : "",
    precioUsd: seccion.precioUsd ? String(seccion.precioUsd) : "",
    contenidoHtml: seccion.contenidoHtml || "",
    contenidoCss: seccion.contenidoCss || "",
    datosEditor: seccion.datosEditor as Record<string, unknown> | null,
    estado: seccion.estado,
    modulos: seccion.modulos.map((m) => ({
      id: m.id,
      nombre: m.nombre,
      descripcion: m.descripcion || "",
      orden: m.orden,
      archivos: m.archivos.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        tipo: a.tipo,
        rutaStorage: a.rutaStorage,
        orden: a.orden,
      })),
    })),
    evento: seccion.evento
      ? {
          id: seccion.evento.id,
          fecha: seccion.evento.fecha.toISOString().split("T")[0],
          horaInicio: seccion.evento.horaInicio,
          horaFin: seccion.evento.horaFin || "",
          lugar: seccion.evento.lugar || "",
          cupoMaximo: seccion.evento.cupoMaximo,
        }
      : null,
  };

  return <SeccionEditor initial={data} />;
}
