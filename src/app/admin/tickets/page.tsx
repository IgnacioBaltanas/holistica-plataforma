import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";
import TicketActions from "@/components/admin/TicketActions";

export const metadata = { title: "Tickets" };

const ESTADO_STYLE: Record<string, string> = {
  ABIERTO: "bg-red-100 text-red-700",
  EN_REVISION: "bg-amber-100 text-amber-700",
  RESUELTO: "bg-green-100 text-green-700",
};

export default async function TicketsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const { estado } = await searchParams;

  const where = estado ? { estado: estado as "ABIERTO" | "EN_REVISION" | "RESUELTO" } : {};

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      cliente: { select: { nombre: true, email: true } },
      pedido: { select: { id: true, tipo: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tickets</h1>
        <div className="flex gap-2">
          <a href="/admin/tickets" className={`px-3 py-1.5 rounded-lg text-sm ${!estado ? "bg-[var(--color-primary)] text-white" : "bg-white border border-gray-200"}`}>Todos</a>
          <a href="/admin/tickets?estado=ABIERTO" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "ABIERTO" ? "bg-red-500 text-white" : "bg-white border border-gray-200"}`}>Abiertos</a>
          <a href="/admin/tickets?estado=EN_REVISION" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "EN_REVISION" ? "bg-amber-500 text-white" : "bg-white border border-gray-200"}`}>En revision</a>
          <a href="/admin/tickets?estado=RESUELTO" className={`px-3 py-1.5 rounded-lg text-sm ${estado === "RESUELTO" ? "bg-green-500 text-white" : "bg-white border border-gray-200"}`}>Resueltos</a>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm">No hay tickets {estado ? `con estado ${estado}` : ""}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div key={t.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{t.cliente.nombre}</span>
                    <span className="text-xs text-gray-400">{t.cliente.email}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${ESTADO_STYLE[t.estado]}`}>
                      {t.estado}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="uppercase">{t.tipo}</span>
                    <span>&middot;</span>
                    <span>{t.canal}</span>
                    <span>&middot;</span>
                    <span>{t.createdAt.toLocaleDateString("es-AR")}</span>
                    {t.pedido && <span>&middot; Pedido #{t.pedido.id.slice(0, 8)}</span>}
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-3">{t.descripcion}</p>

              {t.respuesta && (
                <div className="text-sm bg-green-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-green-700 mb-1">Respuesta:</p>
                  <p className="text-green-800">{t.respuesta}</p>
                </div>
              )}

              {t.estado !== "RESUELTO" && (
                <TicketActions ticketId={t.id} estadoActual={t.estado} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
