import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Calendar, Video, MapPin } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis sesiones" };

export default async function MisSesionesPage({
  searchParams,
}: {
  searchParams: Promise<{ agendada?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { agendada } = await searchParams;

  // Get SESION pedidos (paid) and their associated SesionAgendada
  const pedidosSesion = await prisma.pedido.findMany({
    where: {
      clienteId: session.userId,
      tipo: "SESION",
      estadoPago: "CONFIRMADO",
    },
    include: {
      seccion: { select: { nombre: true } },
      sesion: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const sinAgendar = pedidosSesion.filter((p) => !p.sesion);
  const agendadas = pedidosSesion.filter((p) => p.sesion).map((p) => p.sesion!);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Mis sesiones</h1>

      {agendada && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <p className="text-green-700 font-medium">Sesion agendada correctamente!</p>
          <p className="text-green-600 text-sm">Te enviamos un email de confirmacion con los detalles.</p>
        </div>
      )}

      {/* Sessions pending scheduling */}
      {sinAgendar.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">Pendientes de agendar</h2>
          <div className="space-y-3">
            {sinAgendar.map((pedido) => (
              <div
                key={pedido.id}
                className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold">{pedido.seccion?.nombre || "Sesion"}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Pago confirmado. Elige dia y horario para tu sesion.
                  </p>
                </div>
                <Link
                  href={`/agendar/${pedido.id}`}
                  className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  Agendar
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scheduled sessions */}
      {agendadas.length === 0 && sinAgendar.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes sesiones.</p>
          <Link href="/servicios" className="text-[var(--color-primary)] hover:underline text-sm">
            Ver servicios disponibles
          </Link>
        </div>
      ) : agendadas.length > 0 && (
        <div>
          <h2 className="font-semibold text-gray-500 text-sm uppercase tracking-wide mb-3">Sesiones agendadas</h2>
          <div className="space-y-3">
            {agendadas.map((sesion) => {
              const fechaStr = new Date(sesion.fecha).toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                timeZone: "UTC",
              });

              return (
                <div
                  key={sesion.id}
                  className="bg-white border border-gray-100 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold capitalize">{sesion.tipoServicio}</p>
                      <p className="text-sm text-gray-500 mt-1">{fechaStr}</p>
                      <p className="text-sm text-gray-500">{sesion.horaInicio} - {sesion.horaFin}</p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                        {sesion.modalidad === "virtual" ? (
                          <><Video size={14} /> Virtual</>
                        ) : (
                          <><MapPin size={14} /> Presencial{sesion.lugar ? ` - ${sesion.lugar}` : ""}</>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          sesion.estado === "CONFIRMADA"
                            ? "bg-blue-100 text-blue-700"
                            : sesion.estado === "COMPLETADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sesion.estado === "CONFIRMADA" ? "Proxima" : sesion.estado.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {sesion.meetLink && sesion.estado === "CONFIRMADA" && (
                    <a
                      href={sesion.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-3 bg-blue-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Unirme a la sesion
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
