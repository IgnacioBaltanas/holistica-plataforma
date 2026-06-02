import { MapPin, CalendarDays, Users } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Eventos" };

export default async function EventosPage() {
  const eventos = await prisma.evento.findMany({
    where: {
      estado: { in: ["ABIERTO", "AGOTADO"] },
      fecha: { gte: new Date() },
    },
    include: {
      seccion: { select: { slug: true, imagenPortada: true } },
      _count: { select: { entradas: { where: { estado: { not: "CANCELADA" } } } } },
    },
    orderBy: { fecha: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Eventos</h1>
      <p className="text-gray-500 mb-8">
        Talleres y encuentros presenciales con cupo limitado.
      </p>

      {eventos.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">No hay eventos programados por el momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {eventos.map((evento) => {
            const entradasVendidas = evento._count.entradas;
            const cupoDisponible = evento.cupoMaximo - entradasVendidas;
            const agotado = cupoDisponible <= 0;
            const precio = evento.precioArs ? Number(evento.precioArs) : null;

            return (
              <div
                key={evento.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center">
                  {evento.seccion.imagenPortada ? (
                    <img
                      src={evento.seccion.imagenPortada}
                      alt={evento.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CalendarDays size={48} className="text-amber-300" />
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold mb-3">{evento.nombre}</h3>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p className="flex items-center gap-2">
                      <CalendarDays size={16} />
                      {new Date(evento.fecha).toLocaleDateString("es-AR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      })}{" "}
                      - {evento.horaInicio}hs
                    </p>
                    {evento.lugar && (
                      <p className="flex items-center gap-2">
                        <MapPin size={16} />
                        {evento.lugar}
                      </p>
                    )}
                    <p className="flex items-center gap-2">
                      <Users size={16} />
                      {agotado ? (
                        <span className="text-red-500 font-medium">Agotado</span>
                      ) : (
                        <span>{cupoDisponible} lugares disponibles</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {precio && (
                      <span className="text-xl font-bold text-[var(--color-primary)]">
                        ${precio.toLocaleString("es-AR")} ARS
                      </span>
                    )}
                    {!agotado && (
                      <Link
                        href={`/catalogo/${evento.seccion.slug}`}
                        className="text-sm bg-[var(--color-primary)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                      >
                        Comprar entrada
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
