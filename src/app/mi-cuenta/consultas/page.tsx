import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis consultas" };

const ESTADO_STYLE: Record<string, { bg: string; label: string }> = {
  ABIERTO: { bg: "bg-amber-100 text-amber-700", label: "Abierta" },
  EN_REVISION: { bg: "bg-blue-100 text-blue-700", label: "En revision" },
  RESUELTO: { bg: "bg-green-100 text-green-700", label: "Resuelta" },
};

export default async function MisConsultasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const tickets = await prisma.ticket.findMany({
    where: { clienteId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mis consultas</h1>
        <Link
          href="/contacto"
          className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          Nueva consulta
        </Link>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes consultas.</p>
          <Link href="/contacto" className="text-[var(--color-primary)] hover:underline text-sm">
            Enviar una consulta
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const estado = ESTADO_STYLE[ticket.estado] || ESTADO_STYLE.ABIERTO;

            return (
              <div
                key={ticket.id}
                className="bg-white border border-gray-100 rounded-xl p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 uppercase">{ticket.tipo.replace("_", " ")}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${estado.bg}`}>
                        {estado.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      #{ticket.id.slice(0, 8)} &middot; {ticket.createdAt.toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{ticket.descripcion}</p>
                </div>

                {ticket.respuesta && (
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-purple-600 mb-1">Respuesta</p>
                    <p className="text-sm text-purple-900 whitespace-pre-wrap">{ticket.respuesta}</p>
                  </div>
                )}

                {!ticket.respuesta && ticket.estado !== "RESUELTO" && (
                  <p className="text-xs text-gray-400">
                    Pendiente de respuesta. Te notificaremos por email.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
