import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, PlayCircle, FileText, Music, Image } from "lucide-react";
import Link from "next/link";

const TIPO_ICON: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  pdf: FileText,
  audio: Music,
  imagen: Image,
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seccion = await prisma.seccion.findUnique({
    where: { slug },
    select: { nombre: true },
  });
  return { title: seccion?.nombre || "Curso" };
}

export default async function CursoContenidoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { slug } = await params;

  const seccion = await prisma.seccion.findUnique({
    where: { slug },
    include: {
      modulos: {
        orderBy: { orden: "asc" },
        include: {
          archivos: { orderBy: { orden: "asc" } },
        },
      },
    },
  });

  if (!seccion) notFound();

  // Verify purchase
  const pedido = await prisma.pedido.findFirst({
    where: {
      clienteId: session.userId,
      seccionId: seccion.id,
      estadoPago: "CONFIRMADO",
    },
  });

  if (!pedido) redirect("/catalogo/" + slug);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/mi-cuenta/cursos"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        Mis cursos
      </Link>

      <h1 className="text-2xl font-bold mb-2">{seccion.nombre}</h1>
      {seccion.descripcion && (
        <p className="text-gray-500 mb-8">{seccion.descripcion}</p>
      )}

      {seccion.modulos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <p className="text-gray-400">El contenido se esta preparando. Te avisaremos cuando este listo.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {seccion.modulos.map((modulo) => (
            <div key={modulo.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                <h2 className="font-semibold">{modulo.nombre}</h2>
                {modulo.descripcion && (
                  <p className="text-sm text-gray-400">{modulo.descripcion}</p>
                )}
              </div>

              {modulo.archivos.length === 0 ? (
                <div className="px-5 py-4 text-sm text-gray-400">Sin archivos aun.</div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {modulo.archivos.map((archivo) => {
                    const Icon = TIPO_ICON[archivo.tipo] || FileText;
                    return (
                      <a
                        key={archivo.id}
                        href={`/api/contenido/${archivo.id}`}
                        target={archivo.tipo === "pdf" ? "_blank" : undefined}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon size={20} className="text-[var(--color-primary)] shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{archivo.nombre}</p>
                          <p className="text-xs text-gray-400 uppercase">{archivo.tipo}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
