import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, BookOpen, ShoppingCart, Lock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import BotonComprar from "@/components/compra/BotonComprar";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seccion = await prisma.seccion.findUnique({
    where: { slug },
    select: { nombre: true, descripcion: true },
  });
  if (!seccion) return { title: "No encontrado" };
  return { title: seccion.nombre, description: seccion.descripcion };
}

export default async function CursoDetallePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const seccion = await prisma.seccion.findUnique({
    where: { slug, estado: "PUBLICADO" },
    include: {
      modulos: {
        orderBy: { orden: "asc" },
        include: {
          archivos: { orderBy: { orden: "asc" } },
        },
      },
      evento: true,
    },
  });

  if (!seccion) notFound();

  const session = await getSession();

  // Check if user already purchased this
  let yaComprado = false;
  if (session) {
    const pedido = await prisma.pedido.findFirst({
      where: {
        clienteId: session.userId,
        seccionId: seccion.id,
        estadoPago: "CONFIRMADO",
      },
    });
    yaComprado = !!pedido;
  }

  const precio = seccion.precioArs ? Number(seccion.precioArs) : null;
  const precioUsd = seccion.precioUsd ? Number(seccion.precioUsd) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/catalogo"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[var(--color-primary)] mb-6"
      >
        <ArrowLeft size={16} />
        Volver al catalogo
      </Link>

      {/* Header image */}
      <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl h-64 flex items-center justify-center mb-8 overflow-hidden">
        {seccion.imagenPortada ? (
          <img src={seccion.imagenPortada} alt={seccion.nombre} className="w-full h-full object-cover" />
        ) : (
          <BookOpen size={64} className="text-[var(--color-primary-light)]" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content */}
        <div className="lg:col-span-2">
          <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wide">
            {seccion.template}
          </span>
          <h1 className="text-3xl font-bold mt-1 mb-4">{seccion.nombre}</h1>

          {seccion.descripcion && (
            <p className="text-gray-500 mb-6 whitespace-pre-line">{seccion.descripcion}</p>
          )}

          {/* Custom HTML content from builder */}
          {seccion.contenidoHtml && (
            <div
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: seccion.contenidoHtml }}
            />
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-1">
              <Clock size={16} /> A tu ritmo
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={16} /> {seccion.modulos.length} modulos
            </span>
          </div>

          {/* Modules */}
          {seccion.modulos.length > 0 && (
            <>
              <h2 className="text-xl font-semibold mb-4">Contenido del curso</h2>
              <div className="space-y-3">
                {seccion.modulos.map((modulo) => (
                  <div
                    key={modulo.id}
                    className="bg-white border border-gray-100 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{modulo.nombre}</span>
                      {yaComprado ? (
                        <span className="text-xs text-green-600 font-medium">Disponible</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Lock size={12} /> Al comprar
                        </span>
                      )}
                    </div>
                    {modulo.descripcion && (
                      <p className="text-sm text-gray-400 mt-1">{modulo.descripcion}</p>
                    )}
                    {yaComprado && modulo.archivos.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {modulo.archivos.map((archivo) => (
                          <a
                            key={archivo.id}
                            href={`/api/contenido/${archivo.id}`}
                            className="block text-sm text-[var(--color-primary)] hover:underline pl-4"
                          >
                            {archivo.nombre}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar - Purchase */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
            {precio && (
              <>
                <p className="text-3xl font-bold text-[var(--color-primary)] mb-1">
                  ${precio.toLocaleString("es-AR")} ARS
                </p>
                {precioUsd && (
                  <p className="text-sm text-gray-400 mb-4">
                    o USD ${precioUsd.toLocaleString("en-US")}
                  </p>
                )}
              </>
            )}

            {yaComprado ? (
              <Link
                href="/mi-cuenta/cursos"
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold"
              >
                <BookOpen size={18} />
                Ir a mi contenido
              </Link>
            ) : session ? (
              <BotonComprar
                seccionId={seccion.id}
                tipo={seccion.template === "TALLER" ? "ENTRADA" : "CURSO"}
                nombre={seccion.nombre}
              />
            ) : (
              <Link
                href={`/login?redirect=/catalogo/${seccion.slug}`}
                className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[var(--color-primary-dark)] transition-colors"
              >
                <ShoppingCart size={18} />
                Inicia sesion para comprar
              </Link>
            )}

            <p className="text-xs text-gray-400 mt-4 text-center">
              Acceso inmediato despues del pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
