import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle, Clock, Sparkles } from "lucide-react";

export const metadata = { title: "Mi tirada" };

export default async function MiTiradaDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nueva?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { nueva } = await searchParams;

  const pedido = await prisma.pedido.findUnique({
    where: { id, clienteId: session.userId, tipo: "TIRADA" },
  });

  if (!pedido) notFound();

  const datos = pedido.datosExtra as Record<string, string> | null;
  const isEntregado = pedido.estadoEntrega === "ENTREGADO";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/mi-cuenta/tiradas" className="text-gray-400 hover:text-gray-600 text-sm">
        &larr; Mis tiradas
      </Link>

      {nueva && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-green-700 font-medium">Solicitud enviada</p>
          <p className="text-green-600 text-sm">
            Recibimos tu solicitud. Te contactaremos para coordinar el pago y preparar tu tirada.
          </p>
        </div>
      )}

      <div className="mt-6 bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-xl font-bold">
            {datos?.tipoTirada?.replace(/_/g, " ") || "Tirada personalizada"}
          </h1>
        </div>

        <div className="space-y-3 text-sm mb-6">
          <div>
            <p className="text-gray-400 text-xs">Tu consulta</p>
            <p className="text-gray-700 whitespace-pre-wrap mt-1">{pedido.notas}</p>
          </div>
          {datos?.fechaNacimiento && (
            <div>
              <p className="text-gray-400 text-xs">Fecha de nacimiento</p>
              <p>{datos.fechaNacimiento}</p>
            </div>
          )}
          <div>
            <p className="text-gray-400 text-xs">Solicitada el</p>
            <p>{pedido.createdAt.toLocaleDateString("es-AR")}</p>
          </div>
        </div>

        {/* Status / Content */}
        {isEntregado ? (
          <div className="border-t border-gray-100 pt-6">
            <div className="flex items-center gap-2 text-green-700 mb-4">
              <CheckCircle size={20} />
              <span className="font-semibold">Tu tirada esta lista</span>
            </div>

            {pedido.mensajeRespuesta && (
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-purple-400 mb-1">Mensaje</p>
                <p className="text-sm text-purple-900 whitespace-pre-wrap">{pedido.mensajeRespuesta}</p>
              </div>
            )}

            {pedido.archivoRespuesta && (
              <div className="bg-gray-50 rounded-lg p-4">
                {pedido.archivoRespuesta.match(/\.(mp4|webm|mov)$/i) ? (
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={pedido.archivoRespuesta}
                  />
                ) : pedido.archivoRespuesta.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
                  <audio controls className="w-full" src={pedido.archivoRespuesta} />
                ) : pedido.archivoRespuesta.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <img
                    src={pedido.archivoRespuesta}
                    alt="Tirada"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <a
                    href={pedido.archivoRespuesta}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Descargar archivo
                  </a>
                )}
              </div>
            )}

            {pedido.deliveredAt && (
              <p className="text-xs text-gray-400 mt-3">
                Entregada el {pedido.deliveredAt.toLocaleDateString("es-AR")}
              </p>
            )}
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-6 text-center">
            <Clock size={32} className="mx-auto text-amber-400 mb-2" />
            <p className="font-medium text-gray-700">
              {pedido.estadoEntrega === "EN_PREPARACION"
                ? "Tu tirada esta siendo preparada"
                : "Solicitud recibida"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Te notificaremos por email cuando este lista.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
