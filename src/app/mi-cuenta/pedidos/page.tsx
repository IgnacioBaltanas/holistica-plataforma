import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis pedidos" };

const ESTADO_PAGO_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-700",
  CONFIRMADO: "bg-green-100 text-green-700",
  REEMBOLSADO: "bg-gray-100 text-gray-600",
};

const ESTADO_ENTREGA_STYLE: Record<string, string> = {
  PENDIENTE: "bg-gray-100 text-gray-600",
  EN_PREPARACION: "bg-blue-100 text-blue-700",
  ENTREGADO: "bg-green-100 text-green-700",
  AGENDADO: "bg-purple-100 text-purple-700",
  QR_ENVIADO: "bg-indigo-100 text-indigo-700",
};

export default async function MisPedidosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: session.userId },
    include: {
      seccion: { select: { nombre: true, slug: true } },
      producto: { select: { nombre: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Mis pedidos</h1>

      {pedidos.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes pedidos aun.</p>
          <Link href="/catalogo" className="text-[var(--color-primary)] hover:underline text-sm">
            Explorar catalogo
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map((pedido) => {
            const nombre = pedido.seccion?.nombre || pedido.producto?.nombre || pedido.tipo;
            const monto = pedido.monto ? Number(pedido.monto) : 0;
            const pagoStyle = ESTADO_PAGO_STYLE[pedido.estadoPago] || "bg-gray-100";
            const entregaStyle = ESTADO_ENTREGA_STYLE[pedido.estadoEntrega] || "bg-gray-100";

            return (
              <div
                key={pedido.id}
                className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{nombre}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    #{pedido.id.slice(0, 8)} &middot;{" "}
                    {pedido.createdAt.toLocaleDateString("es-AR")} &middot;{" "}
                    {pedido.tipo}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${pagoStyle}`}>
                    {pedido.estadoPago}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${entregaStyle}`}>
                    {pedido.estadoEntrega}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <p className="font-bold">${monto.toLocaleString("es-AR")}</p>
                  <p className="text-xs text-gray-400">{pedido.moneda}</p>
                </div>

                {pedido.estadoPago === "PENDIENTE" && !pedido.comprobante && (
                  <Link
                    href={`/checkout/${pedido.id}`}
                    className="text-xs bg-[var(--color-primary)] text-white px-3 py-1.5 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors shrink-0"
                  >
                    Pagar
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
