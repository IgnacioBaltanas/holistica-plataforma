import Link from "next/link";
import { BookOpen, Sparkles, Package, Layout } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catalogo" };

const TEMPLATE_ICONS: Record<string, typeof BookOpen> = {
  CURSO: BookOpen,
  TALLER: Sparkles,
  PACK: Package,
  LANDING: Layout,
  LIBRE: Layout,
};

const TEMPLATE_COLORS: Record<string, string> = {
  CURSO: "from-purple-100 to-purple-50",
  TALLER: "from-amber-100 to-amber-50",
  PACK: "from-emerald-100 to-emerald-50",
  LANDING: "from-blue-100 to-blue-50",
  LIBRE: "from-gray-100 to-gray-50",
};

export default async function CatalogoPage() {
  const secciones = await prisma.seccion.findMany({
    where: { estado: "PUBLICADO" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Catalogo</h1>
      <p className="text-gray-500 mb-8">
        Explora nuestros cursos, talleres y recursos disponibles.
      </p>

      {secciones.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">Proximamente agregaremos contenido. Volve pronto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {secciones.map((seccion) => {
            const Icon = TEMPLATE_ICONS[seccion.template] || BookOpen;
            const gradient = TEMPLATE_COLORS[seccion.template] || TEMPLATE_COLORS.CURSO;

            return (
              <Link
                key={seccion.id}
                href={`/catalogo/${seccion.slug}`}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className={`h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                  {seccion.imagenPortada ? (
                    <img
                      src={seccion.imagenPortada}
                      alt={seccion.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon size={48} className="text-gray-300" />
                  )}
                </div>

                <div className="p-5">
                  <span className="text-xs font-medium text-[var(--color-primary)] uppercase tracking-wide">
                    {seccion.template}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
                    {seccion.nombre}
                  </h3>
                  {seccion.descripcion && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {seccion.descripcion}
                    </p>
                  )}
                  {seccion.precioArs && (
                    <p className="text-lg font-bold text-[var(--color-primary)]">
                      ${Number(seccion.precioArs).toLocaleString("es-AR")} ARS
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
