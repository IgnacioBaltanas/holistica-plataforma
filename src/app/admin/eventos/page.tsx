import { prisma } from "@/lib/prisma";
import { CalendarDays, MapPin, Users } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Eventos" };

const ESTADO_STYLE: Record<string, string> = {
  ABIERTO: "bg-green-100 text-green-700",
  AGOTADO: "bg-amber-100 text-amber-700",
  FINALIZADO: "bg-gray-100 text-gray-600",
  CANCELADO: "bg-red-100 text-red-600",
};

export default async function EventosAdminPage() {
  const eventos = await prisma.evento.findMany({
    include: {
      seccion: { select: { nombre: true, slug: true } },
      _count: { select: { entradas: { where: { estado: { not: "CANCELADA" } } } } },
    },
    orderBy: { fecha: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Eventos</h1>
        <p className="text-sm text-gray-400">
          Para crear un evento, crea una seccion tipo &quot;Taller&quot; y vincula el evento desde ahi.
        </p>
      </div>

      {eventos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl text-center py-16">
          <CalendarDays size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400 text-sm mb-2">No hay eventos creados.</p>
          <Link href="/admin/secciones/nueva" className="text-[var(--color-primary)] hover:underline text-sm">
            Crear seccion tipo Taller
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {eventos.map((e) => {
            const vendidas = e._count.entradas;
            const porcentaje = Math.round((vendidas / e.cupoMaximo) * 100);

            return (
              <div key={e.id} className="bg-white border border-gray-100 rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{e.nombre}</h3>
                    <p className="text-xs text-gray-400">{e.seccion.nombre}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${ESTADO_STYLE[e.estado]}`}>
                    {e.estado}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={14} />
                    {new Date(e.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                    {" "}{e.horaInicio}hs
                  </span>
                  {e.lugar && (
                    <span className="flex items-center gap-1"><MapPin size={14} />{e.lugar}</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={14} />{vendidas}/{e.cupoMaximo} entradas
                  </span>
                </div>

                {/* Capacity bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div
                    className={`h-2 rounded-full ${porcentaje >= 90 ? "bg-red-500" : porcentaje >= 60 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </div>

                <Link href={`/admin/eventos/${e.id}`}
                  className="text-xs text-[var(--color-primary)] hover:underline">
                  Ver detalle y asistencia
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
