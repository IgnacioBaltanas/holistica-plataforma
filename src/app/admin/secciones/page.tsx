import Link from "next/link";
import { Plus, BookOpen, Eye, EyeOff, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Secciones" };

const ESTADO_STYLE: Record<string, string> = {
  BORRADOR: "bg-gray-100 text-gray-600",
  PUBLICADO: "bg-green-100 text-green-700",
  ARCHIVADO: "bg-red-100 text-red-600",
};

export default async function SeccionesAdminPage() {
  const secciones = await prisma.seccion.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modulos: true, pedidos: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Secciones</h1>
        <Link
          href="/admin/secciones/nueva"
          className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          <Plus size={18} />
          Nueva seccion
        </Link>
      </div>

      {secciones.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm mb-4">Todavia no hay secciones creadas.</p>
          <Link href="/admin/secciones/nueva" className="text-[var(--color-primary)] hover:underline text-sm">
            Crear la primera seccion
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {secciones.map((s) => (
            <div key={s.id} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="h-28 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                {s.imagenPortada ? (
                  <img src={s.imagenPortada} alt={s.nombre} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={32} className="text-purple-300" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${ESTADO_STYLE[s.estado]}`}>
                    {s.estado}
                  </span>
                  <span className="text-xs text-gray-400 uppercase">{s.template}</span>
                </div>
                <h3 className="font-semibold mb-1">{s.nombre}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {s._count.modulos} modulos &middot; {s._count.pedidos} ventas
                  {s.precioArs && ` · $${Number(s.precioArs).toLocaleString("es-AR")}`}
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/secciones/${s.id}`}
                    className="flex items-center gap-1 text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)]"
                  >
                    <Pencil size={12} /> Editar
                  </Link>
                  <Link
                    href={`/catalogo/${s.slug}`}
                    target="_blank"
                    className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                  >
                    {s.estado === "PUBLICADO" ? <Eye size={12} /> : <EyeOff size={12} />}
                    Ver
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
