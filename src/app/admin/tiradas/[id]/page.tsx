import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EntregarTiradaForm from "@/components/admin/EntregarTiradaForm";
import Link from "next/link";

export const metadata = { title: "Detalle tirada - Admin" };

export default async function TiradaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id, tipo: "TIRADA" },
    include: {
      cliente: { select: { nombre: true, email: true, telefono: true, pais: true } },
    },
  });

  if (!pedido) notFound();

  const datos = pedido.datosExtra as Record<string, string> | null;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tiradas" className="text-gray-400 hover:text-gray-600 text-sm">
          &larr; Volver
        </Link>
        <h1 className="text-2xl font-bold">Tirada #{pedido.id.slice(0, 8)}</h1>
      </div>

      {/* Client info */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Cliente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Nombre</p>
            <p className="font-medium">{pedido.cliente.nombre}</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Email</p>
            <p className="font-medium">{pedido.cliente.email}</p>
          </div>
          {pedido.cliente.telefono && (
            <div>
              <p className="text-gray-400 text-xs">Telefono</p>
              <p className="font-medium">{pedido.cliente.telefono}</p>
            </div>
          )}
          {pedido.cliente.pais && (
            <div>
              <p className="text-gray-400 text-xs">Pais</p>
              <p className="font-medium">{pedido.cliente.pais}</p>
            </div>
          )}
        </div>
      </div>

      {/* Request details */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Solicitud</h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-4">
            <div>
              <p className="text-gray-400 text-xs">Tipo de tirada</p>
              <p className="font-medium">{datos?.tipoTirada?.replace(/_/g, " ") || "-"}</p>
            </div>
            {datos?.fechaNacimiento && (
              <div>
                <p className="text-gray-400 text-xs">Fecha de nacimiento</p>
                <p className="font-medium">{datos.fechaNacimiento}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-xs">Fecha solicitud</p>
              <p className="font-medium">{pedido.createdAt.toLocaleDateString("es-AR")}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 text-xs mb-1">Consulta</p>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {pedido.notas || "-"}
            </div>
          </div>

          {datos?.notasAdicionales && (
            <div>
              <p className="text-gray-400 text-xs mb-1">Notas adicionales</p>
              <p className="text-gray-600">{datos.notasAdicionales}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
        <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">Estado</h2>
        <div className="flex gap-4 text-sm">
          <div>
            <p className="text-gray-400 text-xs">Pago</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
              pedido.estadoPago === "CONFIRMADO" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {pedido.estadoPago}
            </span>
          </div>
          <div>
            <p className="text-gray-400 text-xs">Entrega</p>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${
              pedido.estadoEntrega === "ENTREGADO" ? "bg-green-100 text-green-700" :
              pedido.estadoEntrega === "EN_PREPARACION" ? "bg-blue-100 text-blue-700" :
              "bg-amber-100 text-amber-700"
            }`}>
              {pedido.estadoEntrega}
            </span>
          </div>
          {pedido.deliveredAt && (
            <div>
              <p className="text-gray-400 text-xs">Entregado el</p>
              <p className="font-medium mt-1">{pedido.deliveredAt.toLocaleDateString("es-AR")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Deliver section */}
      {pedido.estadoEntrega === "ENTREGADO" ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h2 className="font-semibold text-green-700 mb-2">Entregado</h2>
          {pedido.mensajeRespuesta && (
            <div className="mb-3">
              <p className="text-xs text-green-600 mb-1">Mensaje enviado:</p>
              <p className="text-sm text-green-800 whitespace-pre-wrap">{pedido.mensajeRespuesta}</p>
            </div>
          )}
          {pedido.archivoRespuesta && (
            <a
              href={pedido.archivoRespuesta}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-700 underline"
            >
              Ver archivo entregado
            </a>
          )}
        </div>
      ) : (
        <EntregarTiradaForm pedidoId={pedido.id} />
      )}
    </div>
  );
}
