import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis tiradas" };

const ESTADO_STYLE: Record<string, { bg: string; label: string }> = {
  PENDIENTE: { bg: "bg-amber-100 text-amber-700", label: "Pendiente" },
  EN_PREPARACION: { bg: "bg-blue-100 text-blue-700", label: "En preparacion" },
  ENTREGADO: { bg: "bg-green-100 text-green-700", label: "Lista" },
};

export default async function MisTiradasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: session.userId, tipo: "TIRADA" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis tiradas</h1>
        <Link
          href="/solicitar-tirada"
          className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Solicitar nueva
        </Link>
      </div>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes tiradas aun.</p>
          <Link href="/solicitar-tirada" className="text-[var(--color-primary)] hover:underline text-sm">
            Solicitar una tirada personalizada
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const datos = pedido.datosExtra as Record<string, string> | null;
            const estado = ESTADO_STYLE[pedido.estadoEntrega] || ESTADO_STYLE.PENDIENTE;

            return (
              <Link
                key={pedido.id}
                href={`/mi-cuenta/tiradas/${pedido.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">
                      {datos?.tipoTirada?.replace(/_/g, " ") || "Tirada personalizada"}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-1 mt-1">{pedido.notas}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium shrink-0 ${estado.bg}`}>
                    {estado.label}
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {pedido.createdAt.toLocaleDateString("es-AR")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
