import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis cursos" };

export default async function MisCursosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pedidos = await prisma.pedido.findMany({
    where: {
      clienteId: session.userId,
      estadoPago: "CONFIRMADO",
      tipo: "CURSO",
    },
    include: {
      seccion: {
        select: { id: true, nombre: true, slug: true, template: true, imagenPortada: true },
      },
    },
    orderBy: { paidAt: "desc" },
  });

  const cursos = pedidos
    .filter((p) => p.seccion)
    .map((p) => p.seccion!);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Mis cursos</h1>

      {cursos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Todavia no compraste ningun curso.</p>
          <Link href="/catalogo" className="text-[var(--color-primary)] hover:underline text-sm">
            Explorar catalogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cursos.map((curso) => (
            <Link
              key={curso.id}
              href={`/mi-cuenta/cursos/${curso.slug}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
            >
              <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center">
                {curso.imagenPortada ? (
                  <img src={curso.imagenPortada} alt={curso.nombre} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen size={32} className="text-[var(--color-primary-light)]" />
                )}
              </div>
              <div className="p-4">
                <span className="text-xs text-[var(--color-primary)] uppercase font-medium">
                  {curso.template}
                </span>
                <h3 className="font-semibold mt-1 group-hover:text-[var(--color-primary)] transition-colors">
                  {curso.nombre}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
