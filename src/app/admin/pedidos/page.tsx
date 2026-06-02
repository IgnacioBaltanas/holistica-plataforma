import { prisma } from "@/lib/prisma";
import { ShoppingBag } from "lucide-react";
import ConfirmarPagoBtn from "@/components/admin/ConfirmarPagoBtn";

export const metadata = { title: "Pedidos" };

const ESTADO_PAGO_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-green-100 text-green-700",
  REEMBOLSADO: "bg-gray-100 text-gray-600",
};

export default async function PedidosAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const where = estado ? { estadoPago: estado as "PENDIENTE" | "CONFIRMADO" | "REEMBOLSADO" } : {};

  const pedidos = await prisma.pedido.findMany({
    where,
    include: {
      cliente: { select: { nombre: true, email: true } },
      seccion: { select: { nombre: true } },
      producto: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <a href="/admin/pedidos" className={`px-3 py-1.5 rounded-lg text-sm ${!estado ? "bg-[var(--color-primary)] text-white" : "bg-white border border-gray-200"}`}>Todos</a>
          <a href="/admin/pedidos?estado=PENDIENTE" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "PENDIENTE" ? "bg-amber-500 text-white" : "bg-white border border-gray-200"}`}>Pendientes</a>
          <a href="/admin/pedidos?estado=CONFIRMADO" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "CONFIRMADO" ? "bg-green-500 text-white" : "bg-white border border-gray-200"}`}>Pagados</a>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">No hay pedidos {estado ? `con estado ${estado}` : ""}.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-500">Pedido</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Cliente</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Producto</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tipo</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Monto</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Pago</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pedidos.map((pedido) => {
                  const nombre = pedido.seccion?.nombre || pedido.producto?.nombre || "-";
                  const monto = pedido.monto ? Number(pedido.monto) : 0;
                  const pagoStyle = ESTADO_PAGO_STYLE[pedido.estadoPago] || "bg-gray-100";

                  return (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{pedido.id.slice(0, 8)}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{pedido.cliente.nombre}</p>
                        <p className="text-xs text-gray-400">{pedido.cliente.email}</p>
                      </td>
                      <td className="px-4 py-3">{nombre}</td>
                      <td className="px-4 py-3 text-xs uppercase text-gray-500">{pedido.tipo}</td>
                      <td className="px-4 py-3 font-medium">${monto.toLocaleString("es-AR")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${pagoStyle}`}>
                          {pedido.estadoPago}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {pedido.createdAt.toLocaleDateString("es-AR")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {pedido.comprobante && (
                            <a
                              href={pedido.comprobante}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Ver comprobante
                            </a>
                          )}
                          {pedido.estadoPago === "PENDIENTE" && (
                            <ConfirmarPagoBtn pedidoId={pedido.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
