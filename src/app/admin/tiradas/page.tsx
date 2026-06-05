import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = { title: "Tiradas - Admin" };

const ESTADO_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  EN_PREPARACION: "bg-blue-100 text-blue-700",
  ENTREGADO: "bg-green-100 text-green-700",
};

const ESTADO_PAGO_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-green-100 text-green-700",
};

export default async function TiradasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const where: Record<string, unknown> = { tipo: "TIRADA" as const };
  if (estado) {
    where.estadoEntrega = estado;
  }

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      cliente: { select: { nombre: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tiradas a pedido</h1>
        <div className="flex gap-2">
          <a href="/admin/tiradas" className={`px-3 py-1.5 rounded-lg text-sm ${!estado ? "bg-[var(--color-primary)] text-white" : "bg-white border border-gray-200"}`}>Todas</a>
          <a href="/admin/tiradas?estado=PENDIENTE" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "PENDIENTE" ? "bg-amber-500 text-white" : "bg-white border border-gray-200"}`}>Pendientes</a>
          <a href="/admin/tiradas?estado=EN_PREPARACION" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "EN_PREPARACION" ? "bg-blue-500 text-white" : "bg-white border border-gray-200"}`}>En preparacion</a>
          <a href="/admin/tiradas?estado=ENTREGADO" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "ENTREGADO" ? "bg-green-500 text-white" : "bg-white border border-gray-200"}`}>Entregadas</a>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <Sparkles size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">No hay tiradas {estado ? `con estado ${estado}` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const datos = pedido.datosExtra as Record<string, string> | null;
            const entregaStyle = ESTADO_STYLE[pedido.estadoEntrega] || "bg-gray-100";
            const pagoStyle = ESTADO_PAGO_STYLE[pedido.estadoPago] || "bg-gray-100";

            return (
              <Link
                key={pedido.id}
                href={`/admin/tiradas/${pedido.id}`}
                className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold">{pedido.cliente.nombre}</p>
                      <span className="text-xs text-gray-400">{pedido.cliente.email}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{pedido.notas}</p>
                    {datos?.tipoTirada && (
                      <p className="text-xs text-gray-400 mt-1">
                        Tipo: {datos.tipoTirada.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${pagoStyle}`}>
                      {pedido.estadoPago}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${entregaStyle}`}>
                      {pedido.estadoEntrega}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400 shrink-0">
                    {pedido.createdAt.toLocaleDateString("es-AR")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
