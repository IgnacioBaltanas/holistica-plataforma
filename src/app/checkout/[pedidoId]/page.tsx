import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/compra/CheckoutForm";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ pedidoId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { pedidoId } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId, clienteId: session.userId },
    include: {
      seccion: { select: { nombre: true, slug: true, template: true } },
    },
  });

  if (!pedido) notFound();

  if (pedido.estadoPago === "CONFIRMADO") {
    redirect("/mi-cuenta/pedidos");
  }

  const monto = pedido.monto ? Number(pedido.monto) : 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Completar compra</h1>

      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-1">{pedido.seccion?.nombre || "Producto"}</h2>
        <p className="text-sm text-gray-500 mb-4">
          Pedido #{pedido.id.slice(0, 8)} - {pedido.tipo}
        </p>

        <div className="flex items-center justify-between border-t border-gray-50 pt-4">
          <span className="text-gray-500">Total a pagar</span>
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            ${monto.toLocaleString("es-AR")} {pedido.moneda}
          </span>
        </div>
      </div>

      <CheckoutForm pedidoId={pedido.id} monto={monto} moneda={pedido.moneda} />
    </div>
  );
}
