import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Ticket, MapPin, CalendarDays, CheckCircle } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Mis entradas" };

export default async function MisEntradasPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const entradas = await prisma.entrada.findMany({
    where: { clienteId: session.userId },
    include: {
      evento: { select: { nombre: true, fecha: true, horaInicio: true, lugar: true } },
    },
    orderBy: { fechaCompra: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold mb-6">Mis entradas</h1>

      {entradas.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-100 rounded-xl">
          <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">No tenes entradas para eventos.</p>
          <Link href="/eventos" className="text-[var(--color-primary)] hover:underline text-sm">
            Ver eventos disponibles
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {entradas.map((entrada) => {
            const esAsistido = entrada.estado === "ASISTIDO";
            const esCancelada = entrada.estado === "CANCELADA";

            return (
              <div
                key={entrada.id}
                className={`bg-white border rounded-xl overflow-hidden ${
                  esCancelada ? "border-gray-200 opacity-60" : "border-gray-100"
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold">{entrada.evento.nombre}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        esAsistido
                          ? "bg-green-100 text-green-700"
                          : esCancelada
                          ? "bg-gray-100 text-gray-500"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {entrada.estado}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={14} />
                      {new Date(entrada.evento.fecha).toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      })}{" "}
                      - {entrada.evento.horaInicio}hs
                    </p>
                    {entrada.evento.lugar && (
                      <p className="flex items-center gap-2">
                        <MapPin size={14} />
                        {entrada.evento.lugar}
                      </p>
                    )}
                  </div>

                  {/* QR Code display */}
                  {entrada.estado === "VALIDA" && entrada.imagenQr && (
                    <div className="border border-gray-100 rounded-lg p-3 text-center">
                      <img
                        src={entrada.imagenQr}
                        alt="QR de entrada"
                        className="w-40 h-40 mx-auto"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Mostra este QR en la puerta del evento
                      </p>
                    </div>
                  )}

                  {entrada.estado === "VALIDA" && !entrada.imagenQr && (
                    <div className="border border-gray-100 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400">
                        Codigo: <span className="font-mono">{entrada.codigoQr}</span>
                      </p>
                    </div>
                  )}

                  {esAsistido && (
                    <div className="flex items-center gap-2 text-green-600 text-sm mt-2">
                      <CheckCircle size={16} />
                      Asistencia registrada
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
