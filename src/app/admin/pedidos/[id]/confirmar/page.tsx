import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import ConfirmarPedidoPanel from "@/components/admin/ConfirmarPedidoPanel";

export const metadata = { title: "Confirmar pago" };

export default async function ConfirmarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await requireAdmin())) redirect("/login");

  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      cliente: { select: { nombre: true, email: true, telefono: true, pais: true } },
      seccion: { select: { nombre: true, template: true } },
      producto: { select: { nombre: true } },
    },
  });

  if (!pedido) notFound();

  const nombreProducto = pedido.seccion?.nombre || pedido.producto?.nombre || pedido.tipo;
  const monto = pedido.monto ? Number(pedido.monto) : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Confirmar pago</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-lg">Datos del pedido</h2>

        <div className="grid grid-cols-2 gap-y-3 text-sm mb-6">
          <span className="text-gray-500">Pedido</span>
          <span className="font-mono">#{pedido.id.slice(0, 8)}</span>

          <span className="text-gray-500">Cliente</span>
          <span className="font-medium">{pedido.cliente.nombre}</span>

          <span className="text-gray-500">Email</span>
          <span>{pedido.cliente.email}</span>

          {pedido.cliente.pais && (
            <>
              <span className="text-gray-500">Pais</span>
              <span>{pedido.cliente.pais}</span>
            </>
          )}

          <span className="text-gray-500">Producto</span>
          <span className="font-medium">{nombreProducto}</span>

          <span className="text-gray-500">Tipo</span>
          <span className="uppercase text-xs">{pedido.tipo}</span>

          <span className="text-gray-500">Monto</span>
          <span className="font-bold text-lg">${monto.toLocaleString("es-AR")} {pedido.moneda}</span>

          <span className="text-gray-500">Metodo</span>
          <span className="uppercase text-xs font-medium">{pedido.metodoPago || "-"}</span>

          <span className="text-gray-500">Estado pago</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded inline-block ${
            pedido.estadoPago === "CONFIRMADO" ? "bg-green-100 text-green-700"
            : pedido.estadoPago === "PENDIENTE" ? "bg-amber-100 text-amber-700"
            : "bg-gray-100 text-gray-600"
          }`}>
            {pedido.estadoPago}
          </span>

          <span className="text-gray-500">Fecha</span>
          <span>{pedido.createdAt.toLocaleString("es-AR")}</span>
        </div>

        {/* Comprobante */}
        {pedido.comprobante && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-sm mb-3">Comprobante adjunto</h3>
            {pedido.comprobante.match(/\.(jpg|jpeg|png|webp)$/i) ? (
              <img
                src={pedido.comprobante}
                alt="Comprobante"
                className="max-w-full rounded-lg border border-gray-200"
              />
            ) : (
              <a
                href={pedido.comprobante}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-primary)] hover:underline text-sm"
              >
                Ver comprobante (PDF)
              </a>
            )}
          </div>
        )}

        {!pedido.comprobante && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              No se adjunto comprobante.
            </p>
          </div>
        )}
      </div>

      {pedido.estadoPago === "PENDIENTE" ? (
        <ConfirmarPedidoPanel pedidoId={pedido.id} pedidoCorto={pedido.id.slice(0, 8)} />
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <p className="text-green-700 font-semibold">Este pedido ya fue confirmado.</p>
          {pedido.paidAt && (
            <p className="text-sm text-green-600 mt-1">
              Confirmado el {pedido.paidAt.toLocaleString("es-AR")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
